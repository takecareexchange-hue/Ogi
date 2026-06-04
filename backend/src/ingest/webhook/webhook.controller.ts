import { Controller, Post, Body, Param, HttpStatus, HttpCode } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('api/v1/ingest/webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post(':practice_id')
  @HttpCode(HttpStatus.ACCEPTED)
  async handleWebhook(
    @Param('practice_id') practiceId: string,
    @Body() payload: any,
  ) {
    return this.webhookService.processWebhook(practiceId, payload);
  }
}
