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
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { PdfWatermarkService } from '../common/services/pdf-watermark.service';
import { Request, Response } from 'express';

@Controller('api/notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(
    private notesService: NotesService,
    private pdfWatermarkService: PdfWatermarkService
  ) {}

  @Post('class/:classId')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Param('classId') classId: string,
    @Body() createNoteDto: CreateNoteDto,
    @UploadedFile() file: any,
  ) {
    return this.notesService.create(createNoteDto, file, classId);
  }

  @Get('class/:classId')
  async findByClass(@Param('classId') classId: string) {
    return this.notesService.findByClass(classId);
  }

  @Get()
  async findAll() {
    return this.notesService.findAll();
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const note = await this.notesService.findById(id);
    if (!note || !note.fileUrl) {
      throw new NotFoundException('Note file not found');
    }

    const filename = note.originalName || `Note_${note.title.replace(/\s+/g, '_')}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

    const isPdf = note.fileUrl.toLowerCase().includes('.pdf');

    if (isPdf) {
      const watermarkedBuffer = await this.pdfWatermarkService.addWatermarkToPdfUrl(
        note.fileUrl,
        req.user.name,
        req.user.grade
      );
      
      if (watermarkedBuffer) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', watermarkedBuffer.length);
        return res.send(watermarkedBuffer);
      }
    }

    return res.redirect(note.fileUrl);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notesService.delete(id);
  }
}
