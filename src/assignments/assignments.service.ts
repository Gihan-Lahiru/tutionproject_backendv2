import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../database/entities/assignment.entity';
import { Submission } from '../database/entities/submission.entity';
import { Class } from '../database/entities/class.entity';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto, classId: string) {
    const assignment = this.assignmentRepository.create({
      id: uuid(),
      ...createAssignmentDto,
      classId,
    });
    const saved = await this.assignmentRepository.save(assignment);

    // Create notifications for students in this class (filter by institute/location)
    try {
      const fullClass = await this.classRepository.findOne({ where: { id: classId }, relations: { students: true } });
      const classLocation = String(fullClass?.location || '').trim().toLowerCase();
      const classStudents = Array.isArray(fullClass?.students) ? fullClass.students : [];

      const targetStudents = classStudents.filter((student) => {
        const studentInstitute = String(student?.institute || '').trim().toLowerCase();
        if (!classLocation) return true;
        return studentInstitute === classLocation;
      });

      if (targetStudents.length) {
        const message = `${createAssignmentDto.title || 'New assignment'} posted for ${fullClass?.title || fullClass?.name || 'your class'}`;
        const notifications = targetStudents.map((student) => ({
          id: uuid(),
          userId: student.id,
          type: 'assignment',
          message,
          read: 0,
        }));

        await this.notificationRepository.save(notifications as any);
      }
    } catch (e) {
      console.warn('Failed to create notifications for assignment', e?.message || e);
    }

    return saved;
  }

  async findByClass(classId: string) {
    return this.assignmentRepository.find({
      where: { classId },
      relations: { submissions: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: { submissions: true, class: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async submit(
    assignmentId: string,
    studentId: string,
    submitDto: SubmitAssignmentDto,
  ) {
    const assignment = await this.findById(assignmentId);

    const existing = await this.submissionRepository.findOne({
      where: { assignmentId, studentId },
    });

    if (existing) {
      Object.assign(existing, submitDto);
      return this.submissionRepository.save(existing);
    }

    const submission = this.submissionRepository.create({
      id: uuid(),
      assignmentId,
      studentId,
      ...submitDto,
    });

    return this.submissionRepository.save(submission);
  }

  async gradeSubmission(submissionId: string, marks: number, remarks: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.marks = marks;
    submission.remarks = remarks;
    return this.submissionRepository.save(submission);
  }

  async getSubmissionsByAssignment(assignmentId: string) {
    return this.submissionRepository.find({
      where: { assignmentId },
      relations: { student: true },
    });
  }
}
