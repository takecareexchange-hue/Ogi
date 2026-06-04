import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { Twilio } from 'twilio';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    const sendGridKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendGridKey) {
      sgMail.setApiKey(sendGridKey);
    }

    const twilioSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    if (twilioSid && twilioToken) {
      this.twilioClient = new Twilio(twilioSid, twilioToken);
    }
  }

  async sendEmail(to: string, subject: string, text: string, html: string): Promise<boolean> {
    const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    const fromName = this.configService.get<string>('SENDGRID_FROM_NAME');

    if (!fromEmail) {
      this.logger.error('SENDGRID_FROM_EMAIL is not configured');
      return false;
    }

    const msg = {
      to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject,
      text,
      html,
    };

    try {
      if (this.configService.get<string>('NODE_ENV') === 'production') {
        await sgMail.send(msg);
      } else {
        this.logger.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendSms(to: string, body: string): Promise<boolean> {
    const fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER');

    if (!fromNumber) {
      this.logger.error('TWILIO_FROM_NUMBER is not configured');
      return false;
    }

    try {
      if (this.configService.get<string>('NODE_ENV') === 'production' && this.twilioClient) {
        await this.twilioClient.messages.create({
          body,
          to,
          from: fromNumber,
        });
      } else {
        this.logger.log(`[MOCK SMS] To: ${to}, Body: ${body}`);
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`, error.stack);
      return false;
    }
  }
}
