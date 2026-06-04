import { Module } from '@nestjs/common';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService]
})
export class IngestModule {}
