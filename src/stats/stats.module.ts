import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Class } from '../database/entities/class.entity';
import { Payment } from '../database/entities/payment.entity';
import { Video } from '../database/entities/video.entity';
import { Paper } from '../database/entities/paper.entity';
import { Assignment } from '../database/entities/assignment.entity';
import { User } from '../database/entities/user.entity';
import { Announcement } from '../database/entities/announcement.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Class, Payment, Video, Paper, User, Announcement, Assignment]), UsersModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
