import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../database/entities/announcement.entity';
import { Class } from '../database/entities/class.entity';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement) private announcementRepository: Repository<Announcement>,
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(message: string, classId: string, userId?: string) {
    const announcement = this.announcementRepository.create({
      id: uuid(),
      classId,
      message,
      createdById: userId,
    });

    const saved = await this.announcementRepository.save(announcement);

    // Create notifications only for students enrolled in this class
    try {
      const fullClass = await this.classRepository.findOne({ where: { id: classId }, relations: ['students'] });
      const classStudents = fullClass && Array.isArray(fullClass.students) ? fullClass.students : [];
      const classLocation = String(fullClass?.location || '').trim().toLowerCase();

      const targetStudents = classStudents.filter((student) => {
        const studentInstitute = String(student?.institute || '').trim().toLowerCase();
        if (!classLocation) return true;
        return studentInstitute === classLocation;
      });

      if (targetStudents.length) {
        const notifications = targetStudents.map((student) => ({
          id: uuid(),
          userId: student.id,
          type: 'announcement',
          message: `New announcement for ${fullClass?.title || fullClass?.name || 'your class'}: ${
            message.length > 120 ? message.slice(0, 117) + '...' : message
          }`,
          read: 0,
        }));

        await this.notificationRepository.save(notifications as any);
      }
    } catch (e) {
      console.warn('Failed to create notifications for announcement', e?.message || e);
    }

    return saved;
  }

  async findByClass(classId: string) {
    return this.announcementRepository.find({ where: { classId }, order: { createdAt: 'DESC' } });
  }
}
