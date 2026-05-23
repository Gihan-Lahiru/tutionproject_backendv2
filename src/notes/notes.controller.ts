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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('api/notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

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

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notesService.delete(id);
  }
}
