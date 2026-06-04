import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ResearchService } from './research.service';
import { EtlService } from './etl.service';

@Controller('api/v1/research')
export class ResearchController {
  constructor(
    private readonly researchService: ResearchService,
    private readonly etlService: EtlService
  ) {}

  @Post('etl')
  async triggerEtl() {
    await this.etlService.runEtl();
    return { message: 'ETL process triggered successfully' };
  }

  @Get('protocol-efficacy')
  async getProtocolEfficacy() {
    return this.researchService.getProtocolEfficacy();
  }

  @Get('market-trends')
  async getMarketTrends() {
    return this.researchService.getMarketTrends();
  }

  @Get('demographics')
  async getCandidateDemographics() {
    return this.researchService.getCandidateDemographics();
  }
}
