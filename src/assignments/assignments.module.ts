import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { Assignment } from '../database/entities/assignment.entity';
import { Submission } from '../database/entities/submission.entity';
import { Class } from '../database/entities/class.entity';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';

import { PdfWatermarkModule } from '../common/services/pdf-watermark.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment, Submission, Class, Notification, User]),
    PdfWatermarkModule,
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
