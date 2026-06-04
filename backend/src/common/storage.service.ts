import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly mockStoragePath = path.join(process.cwd(), 'storage-mock');

  constructor() {
    if (!fs.existsSync(this.mockStoragePath)) {
      fs.mkdirSync(this.mockStoragePath, { recursive: true });
    }
  }

  /**
   * Mock upload to S3. In production, this would use the AWS SDK.
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const fileId = uuidv4();
    const extension = path.extname(fileName);
    const mockPath = `${fileId}${extension}`;
    const fullPath = path.join(this.mockStoragePath, mockPath);

    fs.writeFileSync(fullPath, fileBuffer);
    this.logger.log(`File uploaded to mock storage: ${fullPath}`);

    // Return a mock URL
    return `https://storage.ogi-platform.com/reports/${mockPath}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = path.basename(fileUrl);
    const fullPath = path.join(this.mockStoragePath, fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      this.logger.log(`File deleted from mock storage: ${fullPath}`);
    }
  }
}
