import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../database/entities/video.entity';
import { Class } from '../database/entities/class.entity';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video) private videoRepository: Repository<Video>,
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createVideoDto: any) {
    const video = this.videoRepository.create({
      id: uuid(),
      videoUrl: createVideoDto.videoUrl || createVideoDto.url,
      thumbnailUrl: createVideoDto.thumbnailUrl || createVideoDto.thumbnail_url,
      ...createVideoDto,
    });

    const saved = await this.videoRepository.save(video);

    try {
      const classId = String(saved.classId || createVideoDto.classId || '').trim();
      const grade = String(saved.grade || createVideoDto.grade || '').trim();
      const subject = String(saved.subject || createVideoDto.subject || 'Science').trim();
      const title = String(saved.title || createVideoDto.title || 'New video').trim();

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
      } else if (grade) {
        targetStudents = await this.userRepository.find({
          where: {
            role: 'student',
            grade,
          },
        });
      }

      if (targetStudents.length) {
        const notifications = targetStudents.map((student) => ({
          id: uuid(),
          userId: student.id,
          type: 'video',
          message: `New video uploaded${subject ? ` for ${subject}` : ''}${grade ? ` - Grade ${grade}` : ''}: ${
            title.length > 120 ? title.slice(0, 117) + '...' : title
          }`,
          read: 0,
        }));

        await this.notificationRepository.save(notifications as any);
      }
    } catch (error) {
      console.warn('Failed to create notifications for video upload', error?.message || error);
    }

    return saved;
  }

  async findByClass(classId: string) {
    return this.videoRepository.find({
      where: { classId },
      order: { createdAt: 'DESC' },
    });
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
