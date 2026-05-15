import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paper } from '../database/entities/paper.entity';
import { User } from '../database/entities/user.entity';
import { UploadService } from '../common/services/upload.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuid } from 'uuid';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join, resolve, basename, extname } from 'path';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

@Injectable()
export class PapersService {
  constructor(
    @InjectRepository(Paper) private paperRepository: Repository<Paper>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private uploadService: UploadService,
    private notificationsService: NotificationsService,
  ) {}

  private normalizeGradeBucket(value?: string) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const digits = raw.match(/\d+/)?.[0];
    if (digits) return digits;
    return raw.toLowerCase();
  }

  async upload(
    file: any,
    title: string,
    grade: string,
    type?: string,
    topic?: string,
    classId?: string,
    uploaderName?: string,
    teacherId?: string,
  ) {
    const uploadResult = await this.uploadService.uploadFile(file, 'tuition_sir/papers');

    const paper = this.paperRepository.create({
      id: uuid(),
      title,
      grade,
      type: (type || 'Paper').trim(),
      topic: topic?.trim() || title,
      classId: classId?.trim() || null,
      fileUrl: (uploadResult as any).secure_url,
      filePublicId: (uploadResult as any).public_id,
      teacherId: teacherId?.trim() || null,
    });

    const savedPaper = await this.paperRepository.save(paper);

    const targetGrade = this.normalizeGradeBucket(grade);
    const students = await this.userRepository.find({ where: { role: 'student' } });
    const targetStudents = students.filter((student) => {
      if (!targetGrade) return true;
      return this.normalizeGradeBucket(student.grade) === targetGrade;
    });

    const uploaderLabel = String(uploaderName || 'Teacher').trim() || 'Teacher';
    const contentType = String(type || 'Paper').trim() || 'Paper';
    const contentTitle = String(topic || title || contentType).trim();
    const message = `${uploaderLabel} uploaded a new ${contentType}: ${contentTitle}`;

    await Promise.all(
      targetStudents.map((student) =>
        this.notificationsService.create({
          userId: student.id,
          type: 'content_upload',
          message,
          read: 0,
        }),
      ),
    );

    return savedPaper;
  }

  async findAll(type?: string) {
    const normalizedType = String(type || '').trim();

    if (normalizedType) {
      return this.paperRepository.find({
        where: { type: normalizedType },
        order: { createdAt: 'DESC' },
      });
    }

    return this.paperRepository.find({
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

  async delete(id: string) {
    const paper = await this.findById(id);
    if (paper.filePublicId) {
      await this.uploadService.deleteFile(paper.filePublicId);
    }
    await this.paperRepository.remove(paper);
    return { message: 'Paper deleted successfully' };
  }

  async resolveFileTarget(id: string) {
    const paper = await this.findById(id);
    const fileUrl = paper.fileUrl?.trim();

    if (!fileUrl) {
      throw new NotFoundException('Paper file not found');
    }

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return {
        type: 'remote' as const,
        url: fileUrl,
        filename: `${paper.title || 'paper'}`,
      };
    }

    const relativePath = fileUrl.replace(/^\/+/, '');
    const absolutePath = resolve(process.cwd(), relativePath);
    if (!existsSync(absolutePath)) {
      throw new NotFoundException('Paper file not found on disk');
    }

    return {
      type: 'local' as const,
      path: absolutePath,
      filename: `${paper.title || 'paper'}`,
      mimeType: 'application/octet-stream',
    };
  }

  async resolveDownloadTarget(
    id: string,
    requester?: { id?: string; email?: string; role?: string; name?: string },
  ) {
    const paper = await this.findById(id);
    const fileUrl = paper.fileUrl?.trim();

    if (!fileUrl) {
      throw new NotFoundException('Paper file not found');
    }

    const isPdf = extname(fileUrl).toLowerCase() === '.pdf' || /pdf/i.test(fileUrl);

    if (!isPdf) {
      return this.resolveFileTarget(id);
    }

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return {
        type: 'remote' as const,
        url: fileUrl,
        filename: `${paper.title || 'paper'}.pdf`,
        watermarked: false,
      };
    }

    const relativePath = fileUrl.replace(/^\/+/, '');
    const absolutePath = resolve(process.cwd(), relativePath);
    if (!existsSync(absolutePath)) {
      throw new NotFoundException('Paper file not found on disk');
    }

    const sourceBytes = await readFile(absolutePath);
    const pdfDoc = await PDFDocument.load(sourceBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const brandLine = 'SCIENCE WITH MALEESHA';

    for (const page of pdfDoc.getPages()) {
      const { width, height } = page.getSize();
      const fontSize = Math.max(20, Math.min(width, height) / 9.5);
      const textWidth = brandLine.length * (Math.max(22, fontSize * 0.7) * 0.6); // Rough estimate

      page.drawText(brandLine, {
        x: (width - textWidth) / 2,
        y: height * 0.5,
        size: Math.max(22, fontSize * 0.7),
        font,
        color: rgb(0.35, 0.35, 0.35),
        opacity: 0.18,
      });
    }

    const buffer = await pdfDoc.save();
    return {
      type: 'buffer' as const,
      buffer,
      filename: `${basename(paper.title || 'paper')}.pdf`,
      contentType: 'application/pdf',
    };
  }
}
