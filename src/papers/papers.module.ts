import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { Paper } from '../database/entities/paper.entity';
import { User } from '../database/entities/user.entity';
import { Notification } from '../database/entities/notification.entity';
import { Class } from '../database/entities/class.entity';
import { UploadService } from '../common/services/upload.service';
import { NotificationsModule } from '../notifications/notifications.module';

import { PdfWatermarkModule } from '../common/services/pdf-watermark.module';

@Module({
  imports: [TypeOrmModule.forFeature([Paper, User, Notification, Class]), NotificationsModule, PdfWatermarkModule],
  controllers: [PapersController],
  providers: [PapersService, UploadService],
  exports: [PapersService],
})
export class PapersModule {}
