import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from '../database/entities/announcement.entity';
import { Class } from '../database/entities/class.entity';
import { User } from '../database/entities/user.entity';
import { Notification } from '../database/entities/notification.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement, Class, User, Notification]), UsersModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
