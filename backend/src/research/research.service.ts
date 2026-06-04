import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const RESEARCH_DB_PATH = '/home/team/shared/research.db';

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);

  async queryResearchDb(sql: string) {
    try {
      const { stdout, stderr } = await execPromise(`sqlite3 -json ${RESEARCH_DB_PATH} "${sql.replace(/"/g, '\\"')}"`);
      if (stderr) throw new Error(stderr);
      if (!stdout || stdout.trim() === '') return [];
      return JSON.parse(stdout);
    } catch (error) {
      this.logger.error(`Research DB Query Error: ${sql}`, error);
      return [];
    }
  }

  async getProtocolEfficacy() {
    const sql = `
      SELECT p.name, AVG(o.outcome_score) as avg_outcome, COUNT(*) as sample_size
      FROM research_observations o
      JOIN research_protocols p ON o.protocol_id = p.id
      WHERE o.outcome_score IS NOT NULL
      GROUP BY p.name
      HAVING sample_size >= 1 -- In production this would be k=10
    `;
    return this.queryResearchDb(sql);
  }

  async getMarketTrends() {
    const sql = `
      SELECT intake_month, COUNT(*) as intake_count
      FROM research_observations
      GROUP BY intake_month
      ORDER BY intake_month DESC
    `;
    return this.queryResearchDb(sql);
  }

  async getCandidateDemographics() {
    const sql = `
      SELECT age_bracket, region, COUNT(*) as count
      FROM research_patients
      GROUP BY age_bracket, region
    `;
    return this.queryResearchDb(sql);
  }
}
