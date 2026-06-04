import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpStatus, HttpException, Patch } from '@nestjs/common';
import { WellnessReportsService } from './wellness-reports.service';

@Controller('api/v1/wellness-reports')
export class WellnessReportsController {
  constructor(private readonly wellnessReportsService: WellnessReportsService) {}

  @Get()
  async getReports(
    @Query('practiceId') practiceId: string, // In real app, this would come from the auth token
    @Query('status') status?: string,
  ) {
    if (!practiceId) {
      throw new HttpException('practiceId query parameter is required', HttpStatus.BAD_REQUEST);
    }
    return this.wellnessReportsService.getReportsForPractice(practiceId, status);
  }

  @Get(':id')
  async getReportDetails(@Param('id') id: string) {
    const report = await this.wellnessReportsService.getReportDetails(id);
    if (!report) {
      throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
    }
    return report;
  }

  @Post(':id/approve')
  async approveReport(
    @Param('id') id: string,
    @Body() body: { physicianId: string; protocolId: string },
  ) {
    if (!body.physicianId || !body.protocolId) {
      throw new HttpException('physicianId and protocolId are required', HttpStatus.BAD_REQUEST);
    }
    await this.wellnessReportsService.approveReport(id, body.physicianId, body.protocolId);
    return { message: 'Report approved successfully' };
  }

  @Post(':id/reject')
  async rejectReport(
    @Param('id') id: string,
    @Body() body: { notes: string },
  ) {
    if (!body.notes) {
      throw new HttpException('notes are required', HttpStatus.BAD_REQUEST);
    }
    await this.wellnessReportsService.rejectReport(id, body.notes);
    return { message: 'Report rejected successfully' };
  }
}
