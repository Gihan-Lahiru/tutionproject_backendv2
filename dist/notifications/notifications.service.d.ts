import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
export declare class NotificationsService {
    private notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    create(createNotificationDto: any): Promise<Notification[]>;
    findByUser(userId: string): Promise<Notification[]>;
    findUnreadByUser(userId: string): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notifications.service.d.ts.map