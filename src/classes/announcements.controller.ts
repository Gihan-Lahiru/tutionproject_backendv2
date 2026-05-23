import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Controller('api/classes')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Post(':id/announcements')
  async create(
    @Param('id') classId: string,
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    const created = await this.announcementsService.create(createAnnouncementDto.message, classId, userId);
    return { announcement: created };
  }

  @Get(':id/announcements')
  async findByClass(@Param('id') classId: string) {
    const announcements = await this.announcementsService.findByClass(classId);
    return { announcements };
  }
}
