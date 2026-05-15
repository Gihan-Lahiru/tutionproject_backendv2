import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: any) {
    const notification = this.notificationRepository.create({
      id: uuid(),
      ...createNotificationDto,
    });
    return this.notificationRepository.save(notification);
  }

  async findByUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId, read: 0 },
      order: { createdAt: 'DESC' },
    });
  }

  async markAllAsReadForUser(userId: string) {
    const unreadNotifications = await this.notificationRepository.find({
      where: { userId, read: 0 },
    });

    for (const notification of unreadNotifications) {
      notification.read = 1;
    }

    return this.notificationRepository.save(unreadNotifications);
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.read = 1;
    return this.notificationRepository.save(notification);
  }

  async delete(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    await this.notificationRepository.remove(notification);
    return { message: 'Notification deleted successfully' };
  }
}
