import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
import { NotificationHandlerService } from './notification-handler.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationHandlerService],
  exports: [NotificationsService, NotificationHandlerService],
})
export class NotificationsModule {}

