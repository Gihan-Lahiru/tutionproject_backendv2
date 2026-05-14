import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Assignment } from './assignment.entity';
import { User } from './user.entity';

@Entity('submissions')
@Index(['assignmentId', 'studentId'], { unique: true })
export class Submission {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  assignmentId: string;

  @Column('text')
  studentId: string;

  @Column('text', { nullable: true })
  fileUrl?: string;

  @Column('text', { nullable: true })
  remarks?: string;

  @Column('integer', { nullable: true })
  marks?: number;

  @CreateDateColumn()
  submittedAt: Date;

  @ManyToOne(() => Assignment, (a) => a.submissions)
  assignment: Assignment;

  @ManyToOne(() => User)
  student: User;
}
