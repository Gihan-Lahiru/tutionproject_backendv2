import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { Paper } from '../database/entities/paper.entity';
import { UploadService } from '../common/services/upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Paper])],
  controllers: [PapersController],
  providers: [PapersService, UploadService],
  exports: [PapersService],
})
export class PapersModule {}
