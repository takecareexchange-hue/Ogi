import { Controller, Get, Patch, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { PracticesService } from './practices.service';

@Controller('api/v1/practices')
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  @Get(':id')
  async getPractice(@Param('id') id: string) {
    const practice = await this.practicesService.getPracticeById(id);
    if (!practice) {
      throw new HttpException('Practice not found', HttpStatus.NOT_FOUND);
    }
    return practice;
  }

  @Patch(':id')
  async updatePractice(@Param('id') id: string, @Body() updateData: any) {
    await this.practicesService.updatePractice(id, updateData);
    return { message: 'Practice updated successfully' };
  }
}
