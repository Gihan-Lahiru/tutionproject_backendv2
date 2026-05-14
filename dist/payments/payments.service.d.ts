import { Repository } from 'typeorm';
import { Payment } from '../database/entities/payment.entity';
export declare class PaymentsService {
    private paymentRepository;
    constructor(paymentRepository: Repository<Payment>);
    create(createPaymentDto: any): Promise<Payment[]>;
    findByUser(userId: string): Promise<Payment[]>;
    findAll(): Promise<Payment[]>;
    findById(id: string): Promise<Payment>;
    update(id: string, updatePaymentDto: any): Promise<Payment>;
    updateStatus(id: string, status: string): Promise<Payment>;
}
//# sourceMappingURL=payments.service.d.ts.map