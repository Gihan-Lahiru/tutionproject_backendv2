import { User } from './user.entity';
export declare class Notification {
    id: string;
    userId: string;
    type: string;
    message: string;
    relatedPaymentId?: string;
    read: number;
    createdAt: Date;
    user: User;
}
//# sourceMappingURL=notification.entity.d.ts.map