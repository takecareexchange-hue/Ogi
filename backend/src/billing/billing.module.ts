import { Module } from '@nestjs/common';
import { BillingService } from './billing/billing.service';
import { WebhookController } from './webhook.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [BillingService],
  controllers: [WebhookController],
  exports: [BillingService],
})
export class BillingModule {}
