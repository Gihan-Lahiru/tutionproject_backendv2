import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paper } from '../database/entities/paper.entity';
import { UploadService } from '../common/services/upload.service';
import { v4 as uuid } from 'uuid';
import { promises as fs } from 'fs';
import { join, basename } from 'path';

@Injectable()
export class PapersService {
  constructor(
    @InjectRepository(Paper) private paperRepository: Repository<Paper>,
    private uploadService: UploadService,
  ) {}

  async upload(file: any, title: string, grade: string) {
    const uploadResult = await this.uploadService.uploadFile(file, 'tuition_sir/papers');

    const paper = this.paperRepository.create({
      id: uuid(),
      title,
      grade,
      fileUrl: (uploadResult as any).secure_url,
      filePublicId: (uploadResult as any).public_id,
      originalName: (uploadResult as any).original_name || file.originalname,
    });

    return this.paperRepository.save(paper);
  }

  async findAll() {
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
