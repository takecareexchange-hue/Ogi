import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notification-queue') private readonly notificationQueue: Queue,
    @InjectQueue('follow-up-queue') private readonly followUpQueue: Queue,
    private readonly db: DatabaseService,
  ) {}

  async notifyPhysiciansOfNewCandidate(practiceId: string, intakeId: string) {
    this.logger.log(`Queueing physician notification for intake: ${intakeId}`);
    await this.notificationQueue.add('PHYSICIAN_NEW_CANDIDATE', {
      type: 'PHYSICIAN_NEW_CANDIDATE',
      practiceId,
      intakeId,
    });
  }

  async deliverReportToPatient(reportId: string, channels: string[] = ['email']) {
    const report = await this.db.query(
      `SELECT wr.id, i.patient_id, i.practice_id 
       FROM wellness_reports wr
       JOIN intakes i ON wr.intake_id = i.id
       WHERE wr.id = '${reportId}'`
    );

    if (!report[0]) {
      throw new Error('Report not found');
    }

    this.logger.log(`Queueing report delivery for report: ${reportId}`);
    await this.notificationQueue.add('PATIENT_REPORT_DELIVERY', {
      type: 'PATIENT_REPORT_DELIVERY',
      patientId: report[0].patient_id,
      reportId: report[0].id,
      practiceId: report[0].practice_id,
      channels,
    });

    // Also schedule follow-ups
    await this.scheduleFollowUps(report[0].patient_id, report[0].id);
  }

  private async scheduleFollowUps(patientId: string, reportId: string) {
    const steps = [7, 30, 90];
    for (const step of steps) {
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + step);

      const jobId = `follow-up-${reportId}-${step}`;
      
      // Delay in milliseconds
      const delay = step * 24 * 60 * 60 * 1000;

      await this.followUpQueue.add(
        'PATIENT_FOLLOW_UP',
        {
          type: 'PATIENT_FOLLOW_UP',
          patientId,
          reportId,
          step,
        },
        {
          delay,
          jobId,
        },
      );

      await this.db.run(
        `INSERT INTO follow_up_schedules (id, patient_id, wellness_report_id, sequence_step, scheduled_for, bullmq_job_id, status)
         VALUES ('${jobId}', '${patientId}', '${reportId}', ${step}, '${scheduledFor.toISOString()}', '${jobId}', 'pending')`
      );
    }
  }
}
