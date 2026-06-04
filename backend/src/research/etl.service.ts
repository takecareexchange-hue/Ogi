import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { decrypt } from '../common/utils/encryption.util';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as crypto from 'crypto';

const execPromise = promisify(exec);
const RESEARCH_DB_PATH = '/home/team/shared/research.db';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);
  private readonly salt = 'research-salt';

  constructor(private readonly databaseService: DatabaseService) {}

  async runEtl() {
    this.logger.log('Starting Research ETL process...');

    try {
      // 1. Initialize Research DB if not exists
      await this.initResearchDb();

      // 2. Fetch Clinical Data
      const patients = await this.databaseService.query('SELECT * FROM patients');
      const intakes = await this.databaseService.query('SELECT * FROM intakes');
      const reports = await this.databaseService.query('SELECT * FROM wellness_reports');
      const protocols = await this.databaseService.query('SELECT * FROM protocols');
      const responses = await this.databaseService.query('SELECT * FROM follow_up_responses');

      // 3. Process and Anonymize
      await this.processProtocols(protocols);
      await this.processPatients(patients);
      await this.processObservations(intakes, reports, responses);

      this.logger.log('Research ETL process completed successfully.');
    } catch (error) {
      this.logger.error('Research ETL process failed', error);
      throw error;
    }
  }

  private async queryResearchDb(sql: string) {
    const { stdout, stderr } = await execPromise(`sqlite3 ${RESEARCH_DB_PATH} "${sql.replace(/"/g, '\\"')}"`);
    if (stderr) throw new Error(stderr);
    return stdout;
  }

  private async initResearchDb() {
    const schema = `
      CREATE TABLE IF NOT EXISTS research_patients (
          research_id TEXT PRIMARY KEY,
          age_bracket TEXT NOT NULL,
          region TEXT NOT NULL,
          gender TEXT
      );
      CREATE TABLE IF NOT EXISTS research_protocols (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT
      );
      CREATE TABLE IF NOT EXISTS research_observations (
          observation_id TEXT PRIMARY KEY,
          research_patient_id TEXT NOT NULL,
          protocol_id TEXT,
          symptoms TEXT,
          goals TEXT,
          status TEXT NOT NULL,
          intake_month TEXT NOT NULL,
          outcome_score INTEGER
      );
    `;
    await this.queryResearchDb(schema);
  }

  private anonymizeId(id: string): string {
    return crypto.createHash('sha256').update(id + this.salt).digest('hex');
  }

  private getAgeBracket(dob: string): string {
    // Decrypt DOB if it's encrypted
    let birthDate: Date;
    try {
        const decryptedDob = decrypt(dob);
        birthDate = new Date(decryptedDob);
    } catch {
        birthDate = new Date(dob);
    }
    
    if (isNaN(birthDate.getTime())) return 'Unknown';

    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) return '<18';
    if (age < 26) return '18-25';
    if (age < 36) return '26-35';
    if (age < 46) return '36-45';
    if (age < 56) return '46-55';
    if (age < 66) return '56-65';
    return '66+';
  }

  private async processProtocols(protocols: any[]) {
    for (const p of protocols) {
      const sql = `INSERT OR REPLACE INTO research_protocols (id, name, description) 
                   VALUES ('${p.id}', '${p.name}', '${p.description.replace(/'/g, "''")}');`;
      await this.queryResearchDb(sql);
    }
  }

  private async processPatients(patients: any[]) {
    for (const p of patients) {
      const researchId = this.anonymizeId(p.id);
      const ageBracket = this.getAgeBracket(p.dob_encrypted || p.encrypted_dob);
      // Mock region for now
      const region = 'US-General';
      const sql = `INSERT OR REPLACE INTO research_patients (research_id, age_bracket, region) 
                   VALUES ('${researchId}', '${ageBracket}', '${region}');`;
      await this.queryResearchDb(sql);
    }
  }

  private async processObservations(intakes: any[], reports: any[], responses: any[]) {
    for (const intake of intakes) {
        const researchPatientId = this.anonymizeId(intake.patient_id);
        const report = reports.find(r => r.intake_id === intake.id);
        const response = responses.find(res => res.patient_id === intake.patient_id); // Simplified
        
        const intakeMonth = new Date(intake.created_at).toISOString().substring(0, 7);
        const symptoms = intake.processed_data?.symptoms ? JSON.stringify(intake.processed_data.symptoms) : '[]';
        const goals = intake.processed_data?.goals ? JSON.stringify(intake.processed_data.goals) : '[]';
        
        const sql = `INSERT OR REPLACE INTO research_observations 
                     (observation_id, research_patient_id, protocol_id, symptoms, goals, status, intake_month, outcome_score) 
                     VALUES ('${intake.id}', '${researchPatientId}', '${report?.approved_protocol_id || ""}', 
                             '${symptoms}', '${goals}', '${intake.status}', '${intakeMonth}', ${response?.outcome_score || 'NULL'});`;
        await this.queryResearchDb(sql);
    }
  }
}
