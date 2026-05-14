export declare class StatsService {
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalClasses: number;
        totalAssignments: number;
        totalPayments: number;
    }>;
    getUserStats(userId: string): Promise<{
        userId: string;
        classesEnrolled: number;
        assignmentsSubmitted: number;
        totalPayments: number;
    }>;
    getClassStats(classId: string): Promise<{
        classId: string;
        totalStudents: number;
        totalAssignments: number;
        averageGrade: number;
    }>;
}
//# sourceMappingURL=stats.service.d.ts.map