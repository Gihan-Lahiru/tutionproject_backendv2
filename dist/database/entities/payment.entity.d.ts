import { User } from './user.entity';
export declare class Payment {
    id: string;
    userId: string;
    classId?: string;
    amount: number;
    status: string;
    method?: string;
    receiptUrl?: string;
    approvalStatus: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
//# sourceMappingURL=payment.entity.d.ts.map