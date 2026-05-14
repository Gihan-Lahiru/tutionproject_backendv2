import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getSystemHealth(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
    }>;
    getAdminDashboard(): Promise<{
        totalUsers: number;
        activeUsers: number;
        pendingPayments: number;
        totalRevenue: number;
    }>;
    approvePayment(paymentId: string): Promise<{
        message: string;
        paymentId: string;
    }>;
    rejectPayment(paymentId: string, rejectDto: {
        reason: string;
    }): Promise<{
        message: string;
        paymentId: string;
        reason: string;
    }>;
}
//# sourceMappingURL=admin.controller.d.ts.map