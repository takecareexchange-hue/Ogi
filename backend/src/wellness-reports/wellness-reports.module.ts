import { Module } from '@nestjs/common';
import { WellnessReportsController } from './wellness-reports.controller';
import { ProtocolsController } from './protocols.controller';
import { WellnessReportsService } from './wellness-reports.service';
import { ProtocolsService } from './protocols.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PracticesModule } from '../practices/practices.module';
import { PdfService } from './pdf.service';

@Module({
  imports: [NotificationsModule, PracticesModule],
  controllers: [WellnessReportsController, ProtocolsController],
  providers: [WellnessReportsService, ProtocolsService, PdfService],
  exports: [WellnessReportsService, ProtocolsService],
})
export class WellnessReportsModule {}
