import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Class } from '../database/entities/class.entity';
import { Assignment } from '../database/entities/assignment.entity';
import { Submission } from '../database/entities/submission.entity';
import { Note } from '../database/entities/note.entity';
import { Video } from '../database/entities/video.entity';
import { Payment } from '../database/entities/payment.entity';
import { Paper } from '../database/entities/paper.entity';
import { Notification } from '../database/entities/notification.entity';
import { Announcement } from '../database/entities/announcement.entity';
import { Message } from '../database/entities/message.entity';

const entities = [
  User,
  Class,
  Assignment,
  Submission,
  Note,
  Video,
  Payment,
  Paper,
  Notification,
  Announcement,
  Message,
];

export const typeOrmConfig: TypeOrmModuleOptions =
  {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'u579059016_maleesha123',
        password: process.env.DB_PASSWORD || 'maleeSHA@#$%Gh1',
        database: process.env.DB_NAME || 'u579059016_tution',
        entities,
        synchronize: false,
        logging: process.env.DB_LOGGING === 'true',
      }
    ;
