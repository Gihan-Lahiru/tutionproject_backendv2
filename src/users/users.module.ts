import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../database/entities/user.entity';
import { HostingerStorageModule } from '../nestjs-hostinger-storage/hostinger-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HostingerStorageModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
