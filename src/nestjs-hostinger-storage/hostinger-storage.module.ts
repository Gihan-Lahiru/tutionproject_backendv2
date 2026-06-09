import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HostingerStorageService } from './hostinger-storage.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [HostingerStorageService],
  exports: [HostingerStorageService],
})
export class HostingerStorageModule {}
