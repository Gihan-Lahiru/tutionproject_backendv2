import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paper } from '../database/entities/paper.entity';
import { Notification } from '../database/entities/notification.entity';
import { Class } from '../database/entities/class.entity';
import { User } from '../database/entities/user.entity';
import { UploadService } from '../common/services/upload.service';
import { v4 as uuid } from 'uuid';
import { promises as fs } from 'fs';
import { join, basename } from 'path';

@Injectable()
export class PapersService {
  constructor(
    @InjectRepository(Paper) private paperRepository: Repository<Paper>,
    private uploadService: UploadService,
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async upload(file: any, title: string, grade?: string, type?: string, topic?: string, classId?: string) {
    const uploadResult = await this.uploadService.uploadFile(file, 'tuition_sir/papers');

    const paper = this.paperRepository.create({
      id: uuid(),
      title,
      grade: grade || '',
      type: type || 'Paper',
      topic: topic || '',
      classId: classId || '',
      fileUrl: (uploadResult as any).secure_url,
      filePublicId: (uploadResult as any).public_id,
      originalName: (uploadResult as any).original_name || file.originalname,
    });
    const saved = await this.paperRepository.save(paper);

    // create notifications for students in target class or grade
    try {
      const classId = String(saved.classId || '').trim();
      const gradeVal = String(saved.grade || '').trim();
      const titleVal = String(saved.title || '').trim() || 'New paper';

      let targetStudents: User[] = [];

      if (classId) {
        const fullClass = await this.classRepository.findOne({ where: { id: classId }, relations: ['students'] });
        const classStudents = fullClass && Array.isArray(fullClass.students) ? fullClass.students : [];
        const classLocation = String(fullClass?.location || '').trim().toLowerCase();

        targetStudents = classStudents.filter((student) => {
          const studentInstitute = String(student?.institute || '').trim().toLowerCase();
          if (!classLocation) return true;
          return studentInstitute === classLocation;
        });
      } else if (gradeVal) {
        targetStudents = await this.userRepository.find({ where: { role: 'student', grade: gradeVal } });
      }

      if (targetStudents.length) {
        const notifications = targetStudents.map((student) => ({
          id: uuid(),
          userId: student.id,
          type: (saved.type || 'paper').toLowerCase(),
          message: `New ${saved.type || 'Material'}: ${titleVal.length > 100 ? titleVal.slice(0, 97) + '...' : titleVal}`,
          read: 0,
        }));

        await this.notificationRepository.save(notifications as any);
      }
    } catch (err) {
      console.warn('Failed to create notifications for paper upload', err?.message || err);
    }

    return saved;
  }

  async findAll(type?: string) {
    const whereClause = type ? { type } : {};
    return this.paperRepository.find({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });
  }

  async findByGrade(grade: string) {
    return this.paperRepository.find({
      where: { grade },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const paper = await this.paperRepository.findOne({ where: { id } });
    if (!paper) {
      throw new NotFoundException('Paper not found');
    }
    return paper;
  }

  async incrementDownload(id: string) {
    const paper = await this.findById(id);
    (paper as any).downloads = (Number((paper as any).downloads) || 0) + 1;
    return this.paperRepository.save(paper);
  }

  getLocalFilePath(paper: Paper) {
    const uploadsRoot = join(process.cwd(), 'uploads');
    const publicId = String(paper.filePublicId || '').trim();
    const fileUrl = String(paper.fileUrl || '').trim();

    if (publicId.startsWith('local:')) {
      return join(uploadsRoot, publicId.replace(/^local:/, ''));
    }

    if (publicId) {
      return join(uploadsRoot, publicId);
    }

    if (fileUrl.startsWith('/uploads/')) {
      return join(process.cwd(), fileUrl.replace(/^\/uploads\//, 'uploads/'));
    }

    try {
      const parsed = new URL(fileUrl);
      if (parsed.pathname.startsWith('/uploads/')) {
        return join(process.cwd(), parsed.pathname.replace(/^\/uploads\//, 'uploads/'));
      }
    } catch {
      // Not a URL; fall through.
    }

    return null;
  }

  async getDownloadPath(paper: Paper) {
    const filePath = this.getLocalFilePath(paper);
    if (!filePath) return null;

    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      return null;
    }
  }

  getDownloadFilename(paper: Paper) {
    if ((paper as any).originalName) return String((paper as any).originalName).trim();
    const filePath = this.getLocalFilePath(paper);
    if (filePath) {
      return basename(filePath);
    }
    return `${String(paper.title || 'paper').trim()}.pdf`;
  }

  async delete(id: string) {
    const paper = await this.findById(id);
    if (paper.filePublicId) {
      await this.uploadService.deleteFile(paper.filePublicId);
    }
    await this.paperRepository.remove(paper);
    return { message: 'Paper deleted successfully' };
  }
}
