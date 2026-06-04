import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateWellnessReportPdf(data: {
    practice: any;
    patient: any;
    protocol: any;
    content: any;
    theme: any;
  }): Promise<Buffer> {
    this.logger.log(`Generating PDF for patient: ${data.patient.last_name}`);

    const templatePath = path.join(__dirname, 'templates', 'report.ejs');
    
    // Fallback for development if template is not in dist
    const possibleTemplatePath = path.join(process.cwd(), 'src', 'wellness-reports', 'templates', 'report.ejs');
    const finalTemplatePath = fs.existsSync(templatePath) ? templatePath : possibleTemplatePath;

    const html = await ejs.renderFile(finalTemplatePath, data);

    let browser;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      return pdfBuffer as Buffer;
    } catch (error) {
      this.logger.error(`Failed to generate PDF: ${error.message}`, error.stack);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
