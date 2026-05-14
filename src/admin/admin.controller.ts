import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RequireRoles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('health')
  @RequireRoles('admin')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('dashboard')
  @RequireRoles('admin')
  async getAdminDashboard() {
    return this.adminService.getAdminDashboard();
  }

  @Post('payments/:id/approve')
  @RequireRoles('admin')
  async approvePayment(@Param('id') paymentId: string) {
    return this.adminService.approvePayment(paymentId);
  }

  @Post('payments/:id/reject')
  @RequireRoles('admin')
  async rejectPayment(
    @Param('id') paymentId: string,
    @Body() rejectDto: { reason: string },
  ) {
    return this.adminService.rejectPayment(paymentId, rejectDto.reason);
  }
}
