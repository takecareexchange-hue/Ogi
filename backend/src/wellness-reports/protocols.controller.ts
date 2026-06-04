import { Controller, Get, Param, HttpStatus, HttpException } from '@nestjs/common';
import { ProtocolsService } from './protocols.service';

@Controller('api/v1/protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get()
  async getAllProtocols() {
    return this.protocolsService.getAllActiveProtocols();
  }

  @Get(':id')
  async getProtocolById(@Param('id') id: string) {
    const protocol = await this.protocolsService.getProtocolById(id);
    if (!protocol) {
      throw new HttpException('Protocol not found', HttpStatus.NOT_FOUND);
    }
    return protocol;
  }
}
