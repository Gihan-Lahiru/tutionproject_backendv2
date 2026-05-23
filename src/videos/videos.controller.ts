import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { VideosService } from './videos.service';
import { Request } from 'express';

@Controller('api/videos')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  async create(@Body() createVideoDto: any, @Req() req: Request) {
    const user = req.user as any;
    return this.videosService.create({
      ...createVideoDto,
      videoUrl: createVideoDto.videoUrl || createVideoDto.url,
      thumbnailUrl: createVideoDto.thumbnailUrl || createVideoDto.thumbnail_url,
      teacherId: user?.id,
    });
  }

  @Post('class/:classId')
  async createForClass(
    @Param('classId') classId: string,
    @Body() createVideoDto: any,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.videosService.create({
      ...createVideoDto,
      videoUrl: createVideoDto.videoUrl || createVideoDto.url,
      thumbnailUrl: createVideoDto.thumbnailUrl || createVideoDto.thumbnail_url,
      classId,
      teacherId: user?.id,
    });
  }

  @Get()
  async findAll() {
    return this.videosService.findAll();
  }

  @Get('class/:classId')
  async findByClass(@Param('classId') classId: string) {
    return this.videosService.findByClass(classId);
  }

  @Get('search')
  async findByGradeAndSubject(
    @Query('grade') grade: string,
    @Query('subject') subject: string,
  ) {
    return this.videosService.findByGradeAndSubject(grade, subject);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.videosService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateVideoDto: any) {
    return this.videosService.update(id, updateVideoDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.videosService.delete(id);
  }
}
