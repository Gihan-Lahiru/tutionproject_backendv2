import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PapersService } from './papers.service';
import { Response } from 'express';

@Controller('api/papers')
@UseGuards(JwtAuthGuard)
export class PapersController {
  constructor(private papersService: PapersService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Body() uploadDto: { title: string; grade?: string; type?: string; topic?: string; classId?: string },
  ) {
    return this.papersService.upload(file, uploadDto.title, uploadDto.grade, uploadDto.type, uploadDto.topic, uploadDto.classId);
  }

  @Get()
  async findAll(@Query('type') type?: string) {
    return this.papersService.findAll(type);
  }

  @Get('grade/:grade')
  async findByGrade(@Param('grade') grade: string) {
    return this.papersService.findByGrade(grade);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.papersService.findById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.papersService.delete(id);
  }

  @Post(':id/download')
  async incrementDownload(@Param('id') id: string) {
    const updated = await this.papersService.incrementDownload(id);
    return { downloads: (updated as any).downloads || 0 };
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const paper = await this.papersService.findById(id);
    if (!paper || !paper.fileUrl) {
      throw new NotFoundException('Paper file not found');
    }

    const localPath = await this.papersService.getDownloadPath(paper);
    const filename = paper.originalName || this.papersService.getDownloadFilename(paper)
    if (localPath) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.sendFile(localPath)
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.redirect(paper.fileUrl);
  }

  @Get(':id/file')
  async file(@Param('id') id: string, @Res() res: Response) {
    const paper = await this.papersService.findById(id);
    if (!paper || !paper.fileUrl) {
      throw new NotFoundException('Paper file not found');
    }

    const localPath = await this.papersService.getDownloadPath(paper);
    const filename = paper.originalName || this.papersService.getDownloadFilename(paper)
    if (localPath) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.sendFile(localPath)
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.redirect(paper.fileUrl);
  }
}
