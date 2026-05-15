import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { Paper } from '../database/entities/paper.entity';
import { User } from '../database/entities/user.entity';
import { UploadService } from '../common/services/upload.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Paper, User]), NotificationsModule],
  controllers: [PapersController],
  providers: [PapersService, UploadService],
  exports: [PapersService],
})
export class PapersModule {}
