import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../database/entities/class.entity';
import { Payment } from '../database/entities/payment.entity';
import { Video } from '../database/entities/video.entity';
import { Paper } from '../database/entities/paper.entity';
import { User } from '../database/entities/user.entity';
import { Announcement } from '../database/entities/announcement.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(Video) private videoRepository: Repository<Video>,
    @InjectRepository(Paper) private paperRepository: Repository<Paper>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Announcement) private announcementRepository: Repository<Announcement>,
  ) {}

  async getDashboardStats() {
    return {
      totalUsers: 0,
      totalClasses: 0,
      totalAssignments: 0,
      totalPayments: 0,
    };
  }

  async getUserStats(userId: string) {
    return {
      userId,
      classesEnrolled: 0,
      assignmentsSubmitted: 0,
      totalPayments: 0,
    };
  }

  async getClassStats(classId: string) {
    return {
      classId,
      totalStudents: 0,
      totalAssignments: 0,
      averageGrade: 0,
    };
  }

  async getTeacherStats(teacherId: string) {
    try {
      // Get total classes for this teacher
      const totalClasses = await this.classRepository.count({
        where: { teacherId },
      });

      // Get all classes to count unique students
      const teacherClasses = await this.classRepository.find({
        where: { teacherId },
        relations: ['students'],
      });

      const studentSet = new Set<string>();
      teacherClasses.forEach((cls) => {
        cls.students?.forEach((student) => {
          studentSet.add(student.id);
        });
      });
      const totalStudents = studentSet.size;

      // Get total videos for this teacher
      const totalVideos = await this.videoRepository.count({
        where: { teacherId },
      });

      // Get monthly revenue (current month, approved payments)
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const monthlyPayments = await this.paymentRepository.find({
        where: {
          status: 'completed',
          approvalStatus: 'approved',
        },
      });

      const monthlyRevenue = monthlyPayments
        .filter((payment) => {
          const paymentDate = new Date(payment.createdAt);
          return paymentDate >= currentMonthStart && paymentDate < currentMonthEnd;
        })
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      return {
        totalClasses,
        totalStudents,
        totalVideos,
        monthlyRevenue,
        trends: {
          students: totalStudents > 0 ? '+' + totalStudents : '0',
          classes: totalClasses > 0 ? '+' + totalClasses : '0',
          revenue: monthlyRevenue > 0 ? '+' + monthlyRevenue : '0',
        },
      };
    } catch (error) {
      console.error('Error getting teacher stats:', error);
      return {
        totalClasses: 0,
        totalStudents: 0,
        totalVideos: 0,
        monthlyRevenue: 0,
        trends: null,
      };
    }
  }

  async getTeacherActivity(teacherId: string) {
    try {
      const activities: any[] = [];

      // Get recent papers uploaded by this teacher
      const recentPapers = await this.paperRepository.find({
        where: { teacherId },
        order: { createdAt: 'DESC' },
        take: 5,
      });

      recentPapers.forEach((paper) => {
        activities.push({
          id: paper.id,
          type: 'paper',
          title: `Uploaded ${paper.type}: ${paper.title}`,
          timestamp: paper.createdAt,
          created_at: paper.createdAt,
          class_id: paper.classId,
        });
      });

      // Get recent announcements created by this teacher
      const recentAnnouncements = await this.announcementRepository.find({
        where: { createdById: teacherId },
        order: { createdAt: 'DESC' },
        take: 5,
      });

      recentAnnouncements.forEach((announcement) => {
        activities.push({
          id: announcement.id,
          type: 'announcement',
          title: 'Posted an announcement',
          description: announcement.message,
          timestamp: announcement.createdAt,
          created_at: announcement.createdAt,
          class_id: announcement.classId,
        });
      });

      // Get recent videos uploaded by this teacher
      const recentVideos = await this.videoRepository.find({
        where: { teacherId },
        order: { createdAt: 'DESC' },
        take: 5,
      });

      recentVideos.forEach((video) => {
        activities.push({
          id: video.id,
          type: 'video',
          title: `Uploaded video: ${video.title}`,
          timestamp: video.createdAt,
          created_at: video.createdAt,
        });
      });

      // Get recent approved payments for this teacher's classes
      const classIds = (
        await this.classRepository.find({
          where: { teacherId },
          select: ['id'],
        })
      ).map((c) => c.id);

      if (classIds.length > 0) {
        const recentPayments = await this.paymentRepository.find({
          where: { classId: classIds[0] }, // Using first class for now, could filter by multiple
        });

        recentPayments.slice(0, 5).forEach((payment) => {
          if (payment.approvalStatus === 'approved') {
            activities.push({
              id: payment.id,
              type: 'fee',
              title: `Payment received: Rs ${Number(payment.amount).toLocaleString()}`,
              timestamp: payment.createdAt,
              created_at: payment.createdAt,
            });
          }
        });
      }

      // Sort by timestamp descending and take latest 10
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        activities: activities.slice(0, 10),
      };
    } catch (error) {
      console.error('Error getting teacher activity:', error);
      return {
        activities: [],
      };
    }
  }

  async getTodayClasses(teacherId: string) {
    try {
      const classes = await this.classRepository.find({
        where: { teacherId },
        relations: ['students'],
      });

      const classesWithStudentCount = classes.map((cls) => ({
        id: cls.id,
        title: cls.title || cls.name,
        name: cls.name,
        subject: cls.subject,
        grade: cls.grade,
        time: cls.time,
        day: cls.day,
        student_count: cls.students?.length || 0,
        fee: cls.fee,
        description: cls.description,
      }));

      return {
        classes: classesWithStudentCount,
      };
    } catch (error) {
      console.error('Error getting today classes:', error);
      return {
        classes: [],
      };
    }
  }

  async getStudentStats(studentId: string) {
    try {
      const student = await this.userRepository.findOne({ where: { id: studentId } });
      if (!student) {
        return {
          totalVideos: 0,
          totalPapers: 0,
          totalNotes: 0,
          totalAssignments: 0,
        };
      }

      const studentGrade = student.grade;

      // Count videos available to this student's grade
      const videoCount = await this.videoRepository.count({
        where: { grade: studentGrade },
      });

      // Count papers available to this student's grade
      const paperCount = await this.paperRepository.count({
        where: { grade: studentGrade, type: 'Paper' },
      });

      // Count notes available to this student's grade
      const noteCount = await this.paperRepository.count({
        where: { grade: studentGrade, type: 'Note' },
      });

      // Count assignments available to this student's grade
      const assignmentCount = await this.paperRepository.count({
        where: { grade: studentGrade, type: 'Assignment' },
      });

      return {
        totalVideos: videoCount,
        totalPapers: paperCount,
        totalNotes: noteCount,
        totalAssignments: assignmentCount,
      };
    } catch (error) {
      console.error('Error getting student stats:', error);
      return {
        totalVideos: 0,
        totalPapers: 0,
        totalNotes: 0,
        totalAssignments: 0,
      };
    }
  }

  async getStudentActivity(studentId: string) {
    try {
      const student = await this.userRepository.findOne({ where: { id: studentId } });
      if (!student) {
        return { activities: [] };
      }

      const activities: any[] = [];
      const studentGrade = student.grade;

      // Get recent videos available to student
      const recentVideos = await this.videoRepository.find({
        where: { grade: studentGrade },
        order: { createdAt: 'DESC' },
        take: 3,
      });

      recentVideos.forEach((video) => {
        activities.push({
          id: video.id,
          type: 'video',
          title: `Available: ${video.title}`,
          timestamp: video.createdAt,
          status: 'available',
        });
      });

      // Get recent papers
      const recentPapers = await this.paperRepository.find({
        where: { grade: studentGrade, type: 'Paper' },
        order: { createdAt: 'DESC' },
        take: 3,
      });

      recentPapers.forEach((paper) => {
        activities.push({
          id: paper.id,
          type: 'paper',
          title: `Available: ${paper.title}`,
          timestamp: paper.createdAt,
          status: 'available',
        });
      });

      // Get recent notes
      const recentNotes = await this.paperRepository.find({
        where: { grade: studentGrade, type: 'Note' },
        order: { createdAt: 'DESC' },
        take: 2,
      });

      recentNotes.forEach((note) => {
        activities.push({
          id: note.id,
          type: 'notes',
          title: `Available: ${note.title}`,
          timestamp: note.createdAt,
          status: 'available',
        });
      });

      // Sort by timestamp descending
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        activities: activities.slice(0, 8),
      };
    } catch (error) {
      console.error('Error getting student activity:', error);
      return {
        activities: [],
      };
    }
  }
}
