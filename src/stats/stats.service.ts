import { Injectable } from '@nestjs/common';

@Injectable()
export class StatsService {
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
}
