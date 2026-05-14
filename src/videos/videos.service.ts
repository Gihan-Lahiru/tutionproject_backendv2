import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../database/entities/video.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video) private videoRepository: Repository<Video>,
  ) {}

  async create(createVideoDto: any) {
    const video = this.videoRepository.create({
      id: uuid(),
      ...createVideoDto,
    });
    return this.videoRepository.save(video);
  }

  async findAll() {
    return this.videoRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByGradeAndSubject(grade: string, subject: string) {
    return this.videoRepository.find({
      where: { grade, subject },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const video = await this.videoRepository.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async update(id: string, updateVideoDto: any) {
    const video = await this.findById(id);
    Object.assign(video, updateVideoDto);
    return this.videoRepository.save(video);
  }

  async delete(id: string) {
    const video = await this.findById(id);
    await this.videoRepository.remove(video);
    return { message: 'Video deleted successfully' };
  }
}
