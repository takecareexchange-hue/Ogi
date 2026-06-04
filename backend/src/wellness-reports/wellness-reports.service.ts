import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { encrypt, decrypt } from '../common/utils/encryption.util';
import { NotificationsService } from '../notifications/notifications/notifications.service';
import { PdfService } from './pdf.service';
import { PracticesService } from '../practices/practices.service';
import { ProtocolsService } from './protocols.service';
import { StorageService } from '../common/storage.service';

@Injectable()
export class WellnessReportsService {
  private readonly logger = new Logger(WellnessReportsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
    private readonly pdfService: PdfService,
    private readonly practicesService: PracticesService,
    private readonly protocolsService: ProtocolsService,
    private readonly storageService: StorageService,
  ) {}

  async getReportsForPractice(practiceId: string, status?: string) {
    let query = `
      SELECT wr.*, p.first_name_encrypted, p.last_name_encrypted, p.email_encrypted 
      FROM wellness_reports wr
      JOIN intakes i ON wr.intake_id = i.id
      JOIN patients p ON i.patient_id = p.id
      WHERE i.practice_id = '${practiceId}'
    `;

    if (status) {
      query += ` AND wr.status = '${status}'`;
    }

    const reports = await this.databaseService.query(query);

    return reports.map(report => ({
      ...report,
      patient_first_name: decrypt(report.first_name_encrypted),
      patient_last_name: decrypt(report.last_name_encrypted),
      patient_email: decrypt(report.email_encrypted),
      // Remove encrypted fields from response
      first_name_encrypted: undefined,
      last_name_encrypted: undefined,
      email_encrypted: undefined,
    }));
  }

  async getReportDetails(reportId: string) {
    const report = await this.databaseService.query(`
      SELECT wr.*, p.first_name_encrypted, p.last_name_encrypted, p.email_encrypted, p.dob_encrypted, p.phone_encrypted,
             prot_sug.name as suggested_protocol_name, prot_appr.name as approved_protocol_name
      FROM wellness_reports wr
      JOIN intakes i ON wr.intake_id = i.id
      JOIN patients p ON i.patient_id = p.id
      LEFT JOIN protocols prot_sug ON wr.suggested_protocol_id = prot_sug.id
      LEFT JOIN protocols prot_appr ON wr.approved_protocol_id = prot_appr.id
      WHERE wr.id = '${reportId}'
    `);

    if (!report[0]) {
      return null;
    }

    const r = report[0];
    return {
      ...r,
      patient: {
        first_name: decrypt(r.first_name_encrypted),
        last_name: decrypt(r.last_name_encrypted),
        email: decrypt(r.email_encrypted),
        dob: r.dob_encrypted ? decrypt(r.dob_encrypted) : null,
        phone: r.phone_encrypted ? decrypt(r.phone_encrypted) : null,
      },
      content: r.report_content_encrypted ? JSON.parse(decrypt(r.report_content_encrypted)) : null,
      pdf_url: r.pdf_url_encrypted ? decrypt(r.pdf_url_encrypted) : null,
      // Remove encrypted fields
      first_name_encrypted: undefined,
      last_name_encrypted: undefined,
      email_encrypted: undefined,
      dob_encrypted: undefined,
      phone_encrypted: undefined,
      report_content_encrypted: undefined,
      pdf_url_encrypted: undefined,
    };
  }

  async rejectReport(reportId: string, notes: string) {
    await this.databaseService.run(
      `UPDATE wellness_reports SET status = 'rejected', physician_notes = '${notes.replace(/'/g, "''")}' WHERE id = '${reportId}'`
    );
  }

  async createDraftReport(intakeId: string, physicianId: string | null, suggestedProtocolId: string, content: any) {
    const reportContentEncrypted = encrypt(JSON.stringify(content));
    
    await this.databaseService.run(
      `INSERT INTO wellness_reports (intake_id, physician_id, suggested_protocol_id, report_content_encrypted, status) 
       VALUES ('${intakeId}', ${physicianId ? `'${physicianId}'` : 'NULL'}, '${suggestedProtocolId}', '${reportContentEncrypted}', 'draft')`
    );
    
    this.logger.log(`Draft wellness report created for intake: ${intakeId}`);
  }

  async approveReport(reportId: string, physicianId: string, protocolId: string) {
    const reportData = await this.getReportDetails(reportId);
    if (!reportData) {
      throw new Error('Report not found');
    }

    const practice = await this.practicesService.getPracticeById(reportData.practice_id);
    const protocol = await this.protocolsService.getProtocolById(protocolId);

    if (!practice || !protocol) {
      throw new Error('Practice or Protocol not found');
    }

    // 1. Generate PDF
    this.logger.log(`Generating PDF for report ${reportId}...`);
    const pdfBuffer = await this.pdfService.generateWellnessReportPdf({
      practice,
      patient: reportData.patient,
      protocol,
      content: reportData.content,
      theme: practice.theme_config ? JSON.parse(practice.theme_config) : {},
    });

    // 2. Upload PDF to Secure Storage
    const fileName = `wellness-report-${reportId}.pdf`;
    const pdfUrl = await this.storageService.uploadFile(pdfBuffer, fileName, 'application/pdf');
    const pdfUrlEncrypted = encrypt(pdfUrl);

    // 3. Transactional update
    await this.databaseService.run(
      `UPDATE wellness_reports 
       SET status = 'approved', 
           physician_id = '${physicianId}', 
           approved_protocol_id = '${protocolId}',
           pdf_url_encrypted = '${pdfUrlEncrypted}',
           approved_at = CURRENT_TIMESTAMP
       WHERE id = '${reportId}'`
    );

    await this.databaseService.run(
      `INSERT INTO billing_usage_events (practice_id, report_id, event_type, amount, status)
       VALUES ('${practice.id}', '${reportId}', 'REPORT_APPROVAL', 15.00, 'pending_sync')`
    );

    this.logger.log(`Report ${reportId} approved, PDF generated and billing event created`);

    // 4. Trigger Notification & Delivery
    await this.notificationsService.deliverReportToPatient(reportId, ['email', 'sms']);
  }
}
