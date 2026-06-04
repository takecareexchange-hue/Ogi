import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PracticesService {
  private readonly logger = new Logger(PracticesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getPracticeById(id: string) {
    const practices = await this.databaseService.query(
      `SELECT * FROM practices WHERE id = '${id}'`,
    );
    return practices.length > 0 ? practices[0] : null;
  }

  async updatePractice(id: string, updateData: any) {
    const sets: string[] = [];
    if (updateData.name) sets.push(`name = '${updateData.name.replace(/'/g, "''")}'`);
    if (updateData.logo_url) sets.push(`logo_url = '${updateData.logo_url.replace(/'/g, "''")}'`);
    if (updateData.theme_config) {
      sets.push(`theme_config = '${JSON.stringify(updateData.theme_config).replace(/'/g, "''")}'`);
    }

    if (sets.length === 0) return;

    await this.databaseService.run(
      `UPDATE practices SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = '${id}'`,
    );
  }
}
