import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProtocolsService } from '../wellness-reports/protocols.service';
import { WellnessReportsService } from '../wellness-reports/wellness-reports.service';
import { OpenAIService } from './openai/openai.service';
import { NotificationsService } from '../notifications/notifications/notifications.service';
import { decrypt, encrypt } from '../common/utils/encryption.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IntelligenceService implements OnModuleInit {
  private readonly logger = new Logger(IntelligenceService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly protocolsService: ProtocolsService,
    private readonly wellnessReportsService: WellnessReportsService,
    private readonly openaiService: OpenAIService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    this.logger.log('Intelligence Service initialized. Starting polling...');
    setInterval(() => {
      this.processPendingIntakes();
    }, 10000);
  }

  async processPendingIntakes() {
    const pendingIntakes = await this.databaseService.query(
      "SELECT * FROM intakes WHERE status = 'pending' LIMIT 5",
    );

    for (const intake of pendingIntakes) {
      try {
        await this.processIntake(intake);
      } catch (error) {
        this.logger.error(`Failed to process intake ${intake.id}:`, error);
        await this.databaseService.run(
          `UPDATE intakes SET status = 'flagged', flagged_reason = 'Processing Error: ${error.message}' WHERE id = '${intake.id}'`,
        );
      }
    }
  }

  private async processIntake(intake: any) {
    this.logger.log(`Processing intake: ${intake.id}`);

    // 1. Decrypt raw data
    const decryptedRawData = decrypt(intake.raw_data_encrypted);
    const rawData = JSON.parse(decryptedRawData);

    // 2. Fetch active protocols for analysis
    const protocols = await this.protocolsService.getAllActiveProtocols();

    // 3. AI Analysis (via OpenaiService)
    const analysis = await this.openaiService.analyzeIntake(rawData, protocols);

    // 4. Patient Handling (Standardization)
    const patientId = await this.findOrCreatePatient(
      intake.practice_id,
      analysis.patientInfo,
    );

    // 5. Update Intake Record
    const processedData = JSON.stringify({
      summary: analysis.summary,
      patientInfo: analysis.patientInfo,
      suggestedProtocolId: analysis.suggestedProtocolId,
      analysisNotes: analysis.analysisNotes,
    });

    const status = analysis.flagged ? 'flagged' : 'processed';

    await this.databaseService.run(
      `UPDATE intakes SET 
        patient_id = '${patientId}',
        processed_data = '${processedData.replace(/'/g, "''")}', 
        status = '${status}', 
        ai_confidence_score = ${analysis.confidenceScore}, 
        flagged_reason = '${(analysis.flaggedReason || '').replace(/'/g, "''")}',
        updated_at = CURRENT_TIMESTAMP
       WHERE id = '${intake.id}'`,
    );

    // 6. Create Draft Report if processed and not flagged
    if (status === 'processed' && analysis.suggestedProtocolId) {
      await this.wellnessReportsService.createDraftReport(
        intake.id,
        null, // No physician assigned yet
        analysis.suggestedProtocolId,
        {
          summary: analysis.summary,
          recommendation: analysis.analysisNotes,
          suggestedProtocolId: analysis.suggestedProtocolId,
        },
      );
    }

    this.logger.log(`Intake ${intake.id} successfully processed as ${status}`);

    // 7. Notify Physicians
    if (status === 'processed' || status === 'flagged') {
      await this.notificationsService.notifyPhysiciansOfNewCandidate(intake.practice_id, intake.id);
    }
  }

  private async findOrCreatePatient(practiceId: string, info: any) {
    // Search for existing patient by email (encrypted)
    // For now, we'll simplify and just create a new one to demonstrate the flow

    const patientId = uuidv4();
    const firstNameEnc = encrypt(info.firstName);
    const lastNameEnc = encrypt(info.lastName);
    const emailEnc = encrypt(info.email);
    const dobEnc = encrypt(info.dob);

    await this.databaseService.run(
      `INSERT INTO patients (id, practice_id, first_name_encrypted, last_name_encrypted, email_encrypted, dob_encrypted)
       VALUES ('${patientId}', '${practiceId}', '${firstNameEnc}', '${lastNameEnc}', '${emailEnc}', '${dobEnc}')`,
    );

    return patientId;
  }
}
