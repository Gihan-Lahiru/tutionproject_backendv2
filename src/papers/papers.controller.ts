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
  UploadedFiles,
  Res,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DashboardAccessGuard } from '../common/guards/dashboard-access.guard';
import { PapersService } from './papers.service';
import { PdfWatermarkService } from '../common/services/pdf-watermark.service';
import { Response } from 'express';

@Controller('api/papers')
@UseGuards(JwtAuthGuard, DashboardAccessGuard)
export class PapersController {
  constructor(
    private papersService: PapersService,
    private pdfWatermarkService: PdfWatermarkService
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async upload(
    @UploadedFiles() files: { file?: any[]; thumbnail?: any[] },
    @Body() uploadDto: { title: string; grade?: string; type?: string; topic?: string; classId?: string },
  ) {
    const uploadedFile = files.file?.[0];
    const thumbnailFile = files.thumbnail?.[0];
    return this.papersService.upload(
      uploadedFile,
      uploadDto.title,
      uploadDto.grade,
      uploadDto.type,
      uploadDto.topic,
      uploadDto.classId,
      thumbnailFile,
    );
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
  async download(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const paper = await this.papersService.findById(id);
    if (!paper || !paper.fileUrl) {
      throw new NotFoundException('Paper file not found');
    }

    const filename = paper.originalName || this.papersService.getDownloadFilename(paper);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const isPdf = filename.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      const watermarkedBuffer = await this.pdfWatermarkService.addWatermarkToPdfUrl(
        paper.fileUrl,
        req.user.name,
        req.user.grade
      );
      
      if (watermarkedBuffer) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', watermarkedBuffer.length);
        return res.send(watermarkedBuffer);
      }
    }

    const localPath = await this.papersService.getDownloadPath(paper);
    if (localPath) {
      return res.sendFile(localPath);
    }

    return res.redirect(paper.fileUrl);
  }

  @Get(':id/file')
  async file(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const paper = await this.papersService.findById(id);
    if (!paper || !paper.fileUrl) {
      throw new NotFoundException('Paper file not found');
    }

    const filename = paper.originalName || this.papersService.getDownloadFilename(paper);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const isPdf = filename.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      const watermarkedBuffer = await this.pdfWatermarkService.addWatermarkToPdfUrl(
        paper.fileUrl,
        req.user.name,
        req.user.grade
      );
      
      if (watermarkedBuffer) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', watermarkedBuffer.length);
        return res.send(watermarkedBuffer);
      }
    }

    const localPath = await this.papersService.getDownloadPath(paper);
    if (localPath) {
      return res.sendFile(localPath);
    }

    return res.redirect(paper.fileUrl);
  }
}
