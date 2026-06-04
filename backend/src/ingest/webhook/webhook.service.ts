import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { encrypt } from '../../common/utils/encryption.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async processWebhook(practiceId: string, payload: any) {
    this.logger.log(`Processing webhook for practice: ${practiceId}`);

    // Validate practice exists
    const practices = await this.databaseService.query(
      `SELECT id FROM practices WHERE id = '${practiceId}'`,
    );

    if (practices.length === 0) {
      this.logger.error(`Practice not found: ${practiceId}`);
      throw new NotFoundException('Practice not found');
    }

    // Encrypt raw data
    const rawDataStr = JSON.stringify(payload);
    const encryptedRawData = encrypt(rawDataStr);

    const intakeId = uuidv4();
    
    // Store raw data in the 'intakes' table
    await this.databaseService.run(
      `INSERT INTO intakes (id, practice_id, raw_data_encrypted, status) VALUES ('${intakeId}', '${practiceId}', '${encryptedRawData}', 'pending')`,
    );

    this.logger.log(`Intake stored with ID: ${intakeId}`);

    // Trigger async task (stub)
    this.triggerProcessing(intakeId);

    return {
      status: 'accepted',
      intakeId: intakeId,
    };
  }

  private triggerProcessing(intakeId: string) {
    this.logger.log(`Triggering processing for intake: ${intakeId} (Stub)`);
    // TODO: Implement background processing
  }
}
