import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestModule } from './ingest/ingest.module';
import { DatabaseModule } from './database/database.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { BillingModule } from './billing/billing.module';
import { WellnessReportsModule } from './wellness-reports/wellness-reports.module';
import { PracticesModule } from './practices/practices.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommonModule } from './common/common.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    IngestModule,
    DatabaseModule,
    IntelligenceModule,
    BillingModule,
    WellnessReportsModule,
    PracticesModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
