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
import { EventEmitter2 } from '@nestjs/event-emitter';

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
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto, classId: string) {
    const assignment = this.assignmentRepository.create({
      id: uuid(),
      ...createAssignmentDto,
      classId,
    });
    const saved = await this.assignmentRepository.save(assignment);

    // Emit assignment_uploaded event
    try {
      const fullClass = await this.classRepository.findOne({ where: { id: classId } });
      if (fullClass) {
        this.eventEmitter.emit('assignment_uploaded', {
          type: 'assignment',
          title: saved.title || '',
          subject: fullClass.subject || '',
          grade: fullClass.grade || '',
          institute: fullClass.location || '',
          teacherId: fullClass.teacherId || '',
        });
      }
    } catch (e) {
      console.warn('Failed to emit assignment_uploaded event', e?.message || e);
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
