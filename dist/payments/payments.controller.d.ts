import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    uploadReceipt(req: any, file: Express.Multer.File, body: {
        note?: string;
        amount?: string;
        month?: string;
        year?: string;
    }): Promise<import("../database/entities/payment.entity").Payment>;
    approvePayment(id: string): Promise<import("../database/entities/payment.entity").Payment>;
    rejectPayment(id: string): Promise<import("../database/entities/payment.entity").Payment>;
    create(createPaymentDto: any): Promise<import("../database/entities/payment.entity").Payment[]>;
    findByUser(userId: string): Promise<import("../database/entities/payment.entity").Payment[]>;
    getMyPayments(req: any): Promise<import("../database/entities/payment.entity").Payment[]>;
    getPendingReceipts(): Promise<{
        payments: import("../database/entities/payment.entity").Payment[];
    }>;
    findAll(): Promise<import("../database/entities/payment.entity").Payment[]>;
    findById(id: string): Promise<import("../database/entities/payment.entity").Payment>;
    update(id: string, updatePaymentDto: any): Promise<import("../database/entities/payment.entity").Payment>;
    updateStatus(id: string, statusDto: {
        status: string;
    }): Promise<import("../database/entities/payment.entity").Payment>;
}
//# sourceMappingURL=payments.controller.d.ts.map