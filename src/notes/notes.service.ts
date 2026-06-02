import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../database/entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UploadService } from '../common/services/upload.service';
import { v4 as uuid } from 'uuid';
import { Notification } from '../database/entities/notification.entity';
import { Class } from '../database/entities/class.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private noteRepository: Repository<Note>,
    private uploadService: UploadService,
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(User) private userRepository: Repository<User>,
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

    const saved = await this.noteRepository.save(note);

    // create notifications for students in target class
    try {
      const classIdVal = String(saved.classId || '').trim();
      const titleVal = String(saved.title || '').trim() || 'New note';

      let targetStudents: User[] = [];

      if (classIdVal) {
        const fullClass = await this.classRepository.findOne({ where: { id: classIdVal }, relations: { students: true } });
        const classStudents = fullClass && Array.isArray(fullClass.students) ? fullClass.students : [];
        const classLocation = String(fullClass?.location || '').trim().toLowerCase();

        targetStudents = classStudents.filter((student) => {
          const studentInstitute = String(student?.institute || '').trim().toLowerCase();
          if (!classLocation) return true;
          return studentInstitute === classLocation;
        });
      }

      if (targetStudents.length) {
        const notifications = targetStudents.map((student) => ({
          id: uuid(),
          userId: student.id,
          type: 'note',
          message: `${titleVal.length > 120 ? titleVal.slice(0, 117) + '...' : titleVal}`,
          read: 0,
        }));

        await this.notificationRepository.save(notifications as any);
      }
    } catch (err) {
      console.warn('Failed to create notifications for note upload', err?.message || err);
    }

    return saved;
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

  async findById(id: string) {
    return this.noteRepository.findOne({ where: { id } });
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
