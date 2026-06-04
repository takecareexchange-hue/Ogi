import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  async query<T = any>(sql: string): Promise<T[]> {
    try {
      const { stdout, stderr } = await execPromise(`team-db "${sql.replace(/"/g, '\\"')}"`);
      if (stderr && !stderr.includes('Turso sync')) {
        this.logger.error(`stderr: ${stderr}`);
      }
      if (!stdout || stdout.trim() === '') {
        return [];
      }
      return JSON.parse(stdout);
    } catch (error) {
      this.logger.error(`Error executing query: ${sql}`, error);
      throw error;
    }
  }

  async run(sql: string): Promise<any> {
    return this.query(sql);
  }
}
