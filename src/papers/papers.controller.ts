import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PapersService } from './papers.service';
import { Request, Response } from 'express';

@Controller('api/papers')
@UseGuards(AuthGuard('jwt'))
export class PapersController {
  constructor(private papersService: PapersService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Body() uploadDto: { title: string; grade: string; type?: string; topic?: string; class_id?: string },
    @Req() req: Request,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file was uploaded');
      }

      if (!uploadDto?.title?.trim()) {
        throw new BadRequestException('Title is required');
      }

      if (!uploadDto?.grade?.trim()) {
        throw new BadRequestException('Grade is required');
      }

      const uploader = req.user as any;
      return await this.papersService.upload(
        file,
        uploadDto.title,
        uploadDto.grade,
        uploadDto.type,
        uploadDto.topic,
        uploadDto.class_id,
        uploader?.name || uploader?.email,
        uploader?.id,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(error?.message || 'Failed to upload paper');
    }
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

  @Get(':id/file')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const target = await this.papersService.resolveFileTarget(id);

    if (target.type === 'remote') {
      return res.redirect(target.url);
    }

    return res.download(target.path, target.filename);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const requester = req.user as any;
    const target = await this.papersService.resolveDownloadTarget(id, requester);

    if (target.type === 'remote') {
      return res.redirect(target.url);
    }

    if (target.type === 'buffer') {
      res.setHeader('Content-Type', target.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${target.filename}"`);
      return res.send(Buffer.from(target.buffer));
    }

    return res.download(target.path, target.filename);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.papersService.delete(id);
  }
}
