import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() createNotificationDto: any) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('my-notifications')
  async getMyNotifications(@Req() req: Request) {
    return this.notificationsService.findByUser((req.user as any).id);
  }

  @Get('unread')
  async getUnread(@Req() req: Request) {
    return this.notificationsService.findUnreadByUser((req.user as any).id);
  }

  @Patch('mark-read')
  async markAllAsRead(@Req() req: Request) {
    return this.notificationsService.markAllAsReadForUser((req.user as any).id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.notificationsService.findByUser(userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
