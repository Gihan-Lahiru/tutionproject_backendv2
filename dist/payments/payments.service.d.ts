import { Repository } from 'typeorm';
import { Payment } from '../database/entities/payment.entity';
import { User } from '../database/entities/user.entity';
export declare class PaymentsService {
    private paymentRepository;
    private userRepository;
    constructor(paymentRepository: Repository<Payment>, userRepository: Repository<User>);
    create(createPaymentDto: any): Promise<Payment[]>;
    uploadReceipt(userId: string, receiptUrl: string, body?: any): Promise<Payment>;
    approvePayment(id: string): Promise<Payment>;
    rejectPayment(id: string): Promise<Payment>;
    findByUser(userId: string): Promise<Payment[]>;
    findAll(): Promise<Payment[]>;
    findPendingReceipts(): Promise<{
        payments: Payment[];
    }>;
    findById(id: string): Promise<Payment>;
    update(id: string, updatePaymentDto: any): Promise<Payment>;
    updateStatus(id: string, status: string): Promise<Payment>;
}
//# sourceMappingURL=payments.service.d.ts.map