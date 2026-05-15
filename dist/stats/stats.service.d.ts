import { Repository } from 'typeorm';
import { Class } from '../database/entities/class.entity';
import { Payment } from '../database/entities/payment.entity';
import { Video } from '../database/entities/video.entity';
import { Paper } from '../database/entities/paper.entity';
import { User } from '../database/entities/user.entity';
import { Announcement } from '../database/entities/announcement.entity';
export declare class StatsService {
    private classRepository;
    private paymentRepository;
    private videoRepository;
    private paperRepository;
    private userRepository;
    private announcementRepository;
    constructor(classRepository: Repository<Class>, paymentRepository: Repository<Payment>, videoRepository: Repository<Video>, paperRepository: Repository<Paper>, userRepository: Repository<User>, announcementRepository: Repository<Announcement>);
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
    getTeacherStats(teacherId: string): Promise<{
        totalClasses: number;
        totalStudents: number;
        totalVideos: number;
        monthlyRevenue: number;
        trends: {
            students: string;
            classes: string;
            revenue: string;
        };
    }>;
    getTeacherActivity(teacherId: string): Promise<{
        activities: any[];
    }>;
    getTodayClasses(teacherId: string): Promise<{
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
    getStudentStats(studentId: string): Promise<{
        totalVideos: number;
        totalPapers: number;
        totalNotes: number;
        totalAssignments: number;
    }>;
    getStudentActivity(studentId: string): Promise<{
        activities: any[];
    }>;
}
//# sourceMappingURL=stats.service.d.ts.map