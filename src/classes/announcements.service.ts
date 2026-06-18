import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../database/entities/announcement.entity';
import { Class } from '../database/entities/class.entity';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
import { v4 as uuid } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement) private announcementRepository: Repository<Announcement>,
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(message: string, classId: string, userId?: string) {
    const announcement = this.announcementRepository.create({
      id: uuid(),
      classId,
      message,
      createdById: userId,
    });

    const saved = await this.announcementRepository.save(announcement);

    // Emit announcement_created event
    try {
      const fullClass = await this.classRepository.findOne({ where: { id: classId } });
      if (fullClass) {
        this.eventEmitter.emit('announcement_created', {
          type: 'announcement',
          title: message,
          grade: fullClass.grade || '',
          institute: fullClass.location || '',
          teacherId: userId || '',
        });
      }
    } catch (e) {
      console.warn('Failed to emit announcement_created event', e?.message || e);
    }

    return saved;
  }

  async findByClass(classId: string) {
    return this.announcementRepository.find({ where: { classId }, order: { createdAt: 'DESC' } });
  }
}
