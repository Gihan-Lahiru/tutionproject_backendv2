import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { AnnouncementsModule } from './classes/announcements.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { NotesModule } from './notes/notes.module';
import { VideosModule } from './videos/videos.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { PapersModule } from './papers/papers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatsModule } from './stats/stats.module';
import { AdminModule } from './admin/admin.module';
import { MessagesModule } from './messages/messages.module';
import { PingModule } from './ping/ping.module';

// Entity imports
import { User } from './database/entities/user.entity';
import { Class } from './database/entities/class.entity';
import { Assignment } from './database/entities/assignment.entity';
import { Submission } from './database/entities/submission.entity';
import { Note } from './database/entities/note.entity';
import { Video } from './database/entities/video.entity';
import { Payment } from './database/entities/payment.entity';
import { Paper } from './database/entities/paper.entity';
import { Notification } from './database/entities/notification.entity';
import { Announcement } from './database/entities/announcement.entity';
import { Message } from './database/entities/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mydb',
        entities: [
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
        ],
        synchronize: false,
        logging: process.env.DB_LOGGING === 'true',
      }),
    }),
    AuthModule,
    AnnouncementsModule,
    ClassesModule,
    AssignmentsModule,
    NotesModule,
    VideosModule,
    PaymentsModule,
    UsersModule,
    PapersModule,
    NotificationsModule,
    StatsModule,
    AdminModule,
    MessagesModule,
    PingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}