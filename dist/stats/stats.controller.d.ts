import { StatsService } from './stats.service';
import { Request } from 'express';
export declare class StatsController {
    private statsService;
    constructor(statsService: StatsService);
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
    getTeacherStats(req: Request): Promise<{
        totalClasses: number;
        totalStudents: number;
        totalVideos: number;
        monthlyRevenue: number;
        trends: {
            students: {
                value: number;
                isPositive: boolean;
            };
            classes: {
                value: number;
                isPositive: boolean;
            };
            revenue: {
                value: number;
                isPositive: boolean;
            };
        };
    }>;
    getTeacherActivity(req: Request): Promise<{
        activities: any[];
    }>;
    getTodayClasses(req: Request): Promise<{
        classes: {
            id: string;
            title: string;
            name: string;
            subject: string;
            grade: string;
            time: string;
            day: string;
            student_count: number;
            fee: number;
            description: string;
        }[];
    }>;
    getStudentStats(req: Request): Promise<{
        totalVideos: number;
        totalPapers: number;
        totalNotes: number;
        totalAssignments: number;
    }>;
    getStudentActivity(req: Request): Promise<{
        activities: any[];
    }>;
}
//# sourceMappingURL=stats.controller.d.ts.map