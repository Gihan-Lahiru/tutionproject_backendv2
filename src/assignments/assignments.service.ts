import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../database/entities/assignment.entity';
import { Submission } from '../database/entities/submission.entity';
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
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto, classId: string) {
    const assignment = this.assignmentRepository.create({
      id: uuid(),
      ...createAssignmentDto,
      classId,
    });
    return this.assignmentRepository.save(assignment);
  }

  async findByClass(classId: string) {
    return this.assignmentRepository.find({
      where: { classId },
      relations: ['submissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['submissions', 'class'],
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
      relations: ['student'],
    });
  }
}
