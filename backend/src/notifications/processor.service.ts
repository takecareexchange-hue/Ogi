import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { ProviderService } from './provider.service';
import { decrypt } from '../common/utils/encryption.util';

@Processor('notification-queue')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly provider: ProviderService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing notification job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'PHYSICIAN_NEW_CANDIDATE':
        await this.handlePhysicianNotification(job.data);
        break;
      case 'PATIENT_REPORT_DELIVERY':
        await this.handlePatientReportDelivery(job.data);
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handlePhysicianNotification(data: { practiceId: string; intakeId: string }) {
    const physicians = await this.db.query(
      `SELECT id, email FROM users WHERE practice_id = '${data.practiceId}' AND role = 'physician' AND is_active = 1`
    );

    const portalUrl = this.config.get<string>('PORTAL_BASE_URL');

    for (const physician of physicians) {
      const subject = 'Ogi: New Peptide Candidate for Review';
      const text = `A new patient intake has been processed and flagged as a candidate for peptide therapy. Review here: ${portalUrl}/reports`;
      const html = `<p>A new patient intake has been processed and flagged as a candidate for peptide therapy.</p><p><a href="${portalUrl}/reports">Review here</a></p>`;

      const success = await this.provider.sendEmail(physician.email, subject, text, html);

      await this.db.run(
        `INSERT INTO communication_logs (id, practice_id, recipient_user_id, channel, template_name, status)
         VALUES (lower(hex(randomblob(16))), '${data.practiceId}', '${physician.id}', 'email', 'PHYSICIAN_NEW_CANDIDATE', '${success ? 'sent' : 'failed'}')`
      );
    }
  }

  private async handlePatientReportDelivery(data: { patientId: string; reportId: string; practiceId: string; channels: string[] }) {
    const patient = await this.db.query(
      `SELECT email_encrypted, phone_encrypted FROM patients WHERE id = '${data.patientId}'`
    );

    if (!patient[0]) return;

    const email = decrypt(patient[0].email_encrypted);
    const phone = patient[0].phone_encrypted ? decrypt(patient[0].phone_encrypted) : null;
    const portalUrl = this.config.get<string>('PORTAL_BASE_URL');

    if (data.channels.includes('email')) {
      const subject = 'Your Personalized Wellness Report is Ready';
      const text = `Your personalized wellness report has been approved by your physician. You can access it securely here: ${portalUrl}/reports/${data.reportId}`;
      const html = `<p>Your personalized wellness report has been approved by your physician.</p><p><a href="${portalUrl}/reports/${data.reportId}">Access it securely here</a></p>`;

      const success = await this.provider.sendEmail(email, subject, text, html);
      await this.logCommunication(data.practiceId, data.patientId, 'email', 'PATIENT_REPORT_DELIVERY', success);
    }

    if (data.channels.includes('sms') && phone) {
      const body = `Ogi: Your wellness report is ready. Access it here: ${portalUrl}/reports/${data.reportId}`;
      const success = await this.provider.sendSms(phone, body);
      await this.logCommunication(data.practiceId, data.patientId, 'sms', 'PATIENT_REPORT_DELIVERY', success);
    }

    await this.db.run(
      `UPDATE wellness_reports SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = '${data.reportId}'`
    );
  }

  private async logCommunication(practiceId: string, patientId: string, channel: string, template: string, success: boolean) {
    await this.db.run(
      `INSERT INTO communication_logs (id, practice_id, recipient_patient_id, channel, template_name, status)
       VALUES (lower(hex(randomblob(16))), '${practiceId}', '${patientId}', '${channel}', '${template}', '${success ? 'sent' : 'failed'}')`
    );
  }
}

@Processor('follow-up-queue')
export class FollowUpProcessor extends WorkerHost {
  private readonly logger = new Logger(FollowUpProcessor.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly provider: ProviderService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing follow-up job ${job.id} for step ${job.data.step}`);

    const { patientId, reportId, step } = job.data;

    const patient = await this.db.query(
      `SELECT email_encrypted FROM patients WHERE id = '${patientId}'`
    );

    if (!patient[0]) return;

    const email = decrypt(patient[0].email_encrypted);
    const portalUrl = this.config.get<string>('PORTAL_BASE_URL');

    const subject = `How are you feeling? (Day ${step} Check-in)`;
    const text = `It has been ${step} days since your report. We'd love to hear how you're doing. Please complete your check-in here: ${portalUrl}/check-in/${reportId}`;
    const html = `<p>It has been ${step} days since your report. We'd love to hear how you're doing.</p><p><a href="${portalUrl}/check-in/${reportId}">Complete your check-in here</a></p>`;

    const success = await this.provider.sendEmail(email, subject, text, html);

    await this.db.run(
      `UPDATE follow_up_schedules SET status = '${success ? 'sent' : 'failed'}', updated_at = CURRENT_TIMESTAMP 
       WHERE bullmq_job_id = '${job.id}'`
    );

    await this.db.run(
      `INSERT INTO communication_logs (id, practice_id, recipient_patient_id, channel, template_name, status)
       SELECT lower(hex(randomblob(16))), practice_id, '${patientId}', 'email', 'PATIENT_FOLLOW_UP_DAY_${step}', '${success ? 'sent' : 'failed'}'
       FROM wellness_reports wr
       JOIN intakes i ON wr.intake_id = i.id
       WHERE wr.id = '${reportId}'`
    );
  }
}
