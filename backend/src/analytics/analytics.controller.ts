import { Controller, Get, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('practice')
  async getPracticeAnalytics(@Query('practiceId') practiceId: string) {
    if (!practiceId) {
      throw new HttpException('practiceId query parameter is required', HttpStatus.BAD_REQUEST);
    }
    return this.analyticsService.getPracticeAnalytics(practiceId);
  }
}
