import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Notification } from '../database/entities/notification.entity';
import { v4 as uuid } from 'uuid';

export interface NotificationEvent {
  type: 'paper' | 'note' | 'assignment' | 'announcement';
  title: string;
  subject?: string;
  grade: string | number;
  institute: string;
  teacherId?: string;
}

@Injectable()
export class NotificationHandlerService {
  private readonly logger = new Logger(NotificationHandlerService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  @OnEvent('paper_uploaded')
  async handlePaperUploaded(event: NotificationEvent) {
    this.logger.log(`Handling paper_uploaded event: ${JSON.stringify(event)}`);
    await this.processNotification(event);
  }

  @OnEvent('note_uploaded')
  async handleNoteUploaded(event: NotificationEvent) {
    this.logger.log(`Handling note_uploaded event: ${JSON.stringify(event)}`);
    await this.processNotification(event);
  }

  @OnEvent('assignment_uploaded')
  async handleAssignmentUploaded(event: NotificationEvent) {
    this.logger.log(`Handling assignment_uploaded event: ${JSON.stringify(event)}`);
    await this.processNotification(event);
  }

  @OnEvent('announcement_created')
  async handleAnnouncementCreated(event: NotificationEvent) {
    this.logger.log(`Handling announcement_created event: ${JSON.stringify(event)}`);
    await this.processNotification(event);
  }

  private async processNotification(event: NotificationEvent) {
    try {
      const gradeStr = String(event.grade || '').trim();
      const instituteStr = String(event.institute || '').trim().toLowerCase();

      if (!gradeStr) {
        this.logger.warn(`Missing grade in event, skipping notifications.`);
        return;
      }

      const normalizeGrade = (g: string) => g.toLowerCase().replace('grade', '').trim();
      const targetGradeNormalized = normalizeGrade(gradeStr);

      // 1. Fetch all students
      const students = await this.userRepository.find({
        where: {
          role: 'student',
        },
      });

      // Filter by normalized grade and optional institute matching rules
      const targetStudents = students.filter(student => {
        const studentGrade = normalizeGrade(student.grade || '');
        if (studentGrade !== targetGradeNormalized) {
          return false;
        }

        // If event institute is specified, filter by it.
        // Otherwise, matching is grade-wide (allow all).
        if (instituteStr) {
          const studentInstitute = String(student.institute || '').trim().toLowerCase();
          return studentInstitute === instituteStr;
        }

        return true;
      });

      if (targetStudents.length === 0) {
        this.logger.log(`No students found matching normalized grade "${targetGradeNormalized}" and institute filter "${instituteStr || 'any'}".`);
        return;
      }

      // 2. Format the message according to the rules
      let message = '';
      const subjectText = event.subject || 'your subject';

      if (event.type === 'paper') {
        message = `📄 New paper uploaded in ${subjectText}`;
      } else if (event.type === 'note') {
        message = `📝 New note uploaded in ${subjectText}`;
      } else if (event.type === 'assignment') {
        message = `📚 New assignment uploaded in ${subjectText}`;
      } else if (event.type === 'announcement') {
        message = `📢 New announcement: ${event.title}`;
      } else {
        message = `New update: ${event.title}`;
      }

      // 3. For each matched student, create a notification record
      const notifications = targetStudents.map(student => {
        return this.notificationRepository.create({
          id: uuid(),
          userId: student.id,
          type: event.type,
          message: message,
          read: 0,
        });
      });

      await this.notificationRepository.save(notifications);
      this.logger.log(`Successfully created ${notifications.length} notifications for students of grade "${gradeStr}" and institute "${instituteStr}".`);
    } catch (error) {
      this.logger.error(`Error processing notification: ${error.message}`, error.stack);
    }
  }
}
