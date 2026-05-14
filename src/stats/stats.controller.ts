import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';

@Controller('api/stats')
@UseGuards(AuthGuard('jwt'))
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('user/:userId')
  async getUserStats(@Param('userId') userId: string) {
    return this.statsService.getUserStats(userId);
  }

  @Get('class/:classId')
  async getClassStats(@Param('classId') classId: string) {
    return this.statsService.getClassStats(classId);
  }
}
