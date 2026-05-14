export declare class AdminService {
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
    rejectPayment(paymentId: string, reason: string): Promise<{
        message: string;
        paymentId: string;
        reason: string;
    }>;
}
//# sourceMappingURL=admin.service.d.ts.map