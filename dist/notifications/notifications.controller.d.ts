import { Request } from 'express';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: any): Promise<import("../database/entities/notification.entity").Notification[]>;
    getMyNotifications(req: Request): Promise<import("../database/entities/notification.entity").Notification[]>;
    getUnread(req: Request): Promise<import("../database/entities/notification.entity").Notification[]>;
    findByUser(userId: string): Promise<import("../database/entities/notification.entity").Notification[]>;
    markAsRead(id: string): Promise<import("../database/entities/notification.entity").Notification>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notifications.controller.d.ts.map