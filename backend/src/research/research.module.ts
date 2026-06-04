import { Module } from '@nestjs/common';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { EtlService } from './etl.service';
import { DatabaseModule } from '../database/database.module';
import { PracticesModule } from '../practices/practices.module';

@Module({
  imports: [DatabaseModule, PracticesModule],
  controllers: [ResearchController],
  providers: [ResearchService, EtlService],
})
export class ResearchModule {}
