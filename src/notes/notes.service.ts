import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../database/entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UploadService } from '../common/services/upload.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private noteRepository: Repository<Note>,
    private uploadService: UploadService,
  ) {}

  async create(
    createNoteDto: CreateNoteDto,
    file: any,
    classId: string,
  ) {
    const uploadResult = await this.uploadService.uploadFile(file, 'tuition_sir/notes');

    const note = this.noteRepository.create({
      id: uuid(),
      ...createNoteDto,
      classId,
      fileUrl: (uploadResult as any).secure_url,
      fileType: file.mimetype,
      originalName: (uploadResult as any).original_name || file.originalname,
    });

    return this.noteRepository.save(note);
  }

  async findByClass(classId: string) {
    return this.noteRepository.find({
      where: { classId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.noteRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string) {
    const note = await this.noteRepository.findOne({ where: { id } });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.noteRepository.remove(note);
    return { message: 'Note deleted successfully' };
  }
}
