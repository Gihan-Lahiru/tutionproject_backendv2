import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PingService } from './ping.service';

@Controller()
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  async ping() {
    const health = await this.pingService.checkHealth();

    if (health.status === 'error') {
      throw new ServiceUnavailableException(health);
    }

    return {
      ...health,
      statusCode: HttpStatus.OK,
    };
  }
}