import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paper } from '../database/entities/paper.entity';
import { UploadService } from '../common/services/upload.service';
import { v4 as uuid } from 'uuid';

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

  async delete(id: string) {
    const paper = await this.findById(id);
    if (paper.filePublicId) {
      await this.uploadService.deleteFile(paper.filePublicId);
    }
    await this.paperRepository.remove(paper);
    return { message: 'Paper deleted successfully' };
  }
}
