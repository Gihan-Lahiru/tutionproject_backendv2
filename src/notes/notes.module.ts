import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { Note } from '../database/entities/note.entity';
import { Notification } from '../database/entities/notification.entity';
import { Class } from '../database/entities/class.entity';
import { User } from '../database/entities/user.entity';
import { UploadService } from '../common/services/upload.service';
import { PdfWatermarkModule } from '../common/services/pdf-watermark.module';

@Module({
  imports: [TypeOrmModule.forFeature([Note, Notification, Class, User]), PdfWatermarkModule],
  controllers: [NotesController],
  providers: [NotesService, UploadService],
})
export class NotesModule {}
