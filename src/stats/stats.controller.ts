import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';
import { Request } from 'express';

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

  @Get('teacher-stats')
  async getTeacherStats(@Req() req: Request) {
    const user = req.user as any;
    return this.statsService.getTeacherStats(user?.id);
  }

  @Get('teacher-activity')
  async getTeacherActivity(@Req() req: Request) {
    const user = req.user as any;
    return this.statsService.getTeacherActivity(user?.id);
  }

  @Get('today-classes')
  async getTodayClasses(@Req() req: Request) {
    const user = req.user as any;
    return this.statsService.getTodayClasses(user?.id);
  }

  @Get('student-stats')
  async getStudentStats(@Req() req: Request) {
    const user = req.user as any;
    return this.statsService.getStudentStats(user?.id);
  }

  @Get('student-activity')
  async getStudentActivity(@Req() req: Request) {
    const user = req.user as any;
    return this.statsService.getStudentActivity(user?.id);
  }
}
