import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProtocolsService {
  private readonly logger = new Logger(ProtocolsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getAllActiveProtocols() {
    return this.databaseService.query(
      "SELECT * FROM protocols WHERE is_active = 1",
    );
  }

  async getProtocolById(id: string) {
    const protocols = await this.databaseService.query(
      `SELECT * FROM protocols WHERE id = '${id}'`,
    );
    return protocols.length > 0 ? protocols[0] : null;
  }
}
