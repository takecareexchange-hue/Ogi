import { Module } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { OpenAIService } from './openai/openai.service';
import { WellnessReportsModule } from '../wellness-reports/wellness-reports.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [WellnessReportsModule, NotificationsModule],
  providers: [IntelligenceService, OpenAIService],
  exports: [IntelligenceService],
})
export class IntelligenceModule {}
