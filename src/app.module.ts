import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { NotesModule } from './notes/notes.module';
import { VideosModule } from './videos/videos.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { PapersModule } from './papers/papers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatsModule } from './stats/stats.module';
import { AdminModule } from './admin/admin.module';
import { typeOrmConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
