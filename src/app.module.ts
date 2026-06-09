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
          join(__dirname, '..', 'database', 'entities', '*.entity.{ts,js}'),
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