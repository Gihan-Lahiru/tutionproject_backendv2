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
];

export const typeOrmConfig: TypeOrmModuleOptions =
  process.env.NODE_ENV === 'production'
    ? {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tuition_sir',
        entities,
        synchronize: false,
        logging: process.env.DB_LOGGING === 'true',
      }
    : {
        type: 'sqlite',
        database: 'tuition_sir.db',
        entities,
        synchronize: true,
        logging: false,
      };
