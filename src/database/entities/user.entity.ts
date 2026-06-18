import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Class } from './class.entity';
import { Assignment } from './assignment.entity';

@Entity('users')
export class User {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  name: string;

  @Column('text', { default: 'student' })
  role: string; // student, teacher, admin

  @Column('text', { nullable: true })
  profilePicture?: string;

  @Column('text', { nullable: true })
  tuitionClass?: string;

  @Column('text', { nullable: true })
  grade?: string;

  @Column('text', { nullable: true })
  phone?: string;

  @Column('text', { nullable: true })
  institute?: string;

  @Column('text', { nullable: true })
  emailVerificationCode?: string;

  @Column('boolean', { default: true })
  emailVerified: boolean;

  @Column('text', { default: 'pending' })
  approvalStatus: string; // pending, approved, rejected

  @Column('text', { default: 'active' })
  status: string; // active, inactive, suspended

  @Column('text', { default: 'unpaid' })
  paymentStatus: string; // paid, unpaid, pending_verification, rejected

  @Column('datetime', { nullable: true })
  paymentDueDate?: Date;

  @Column('boolean', { default: true })
  dashboardAccess: boolean;

  @Column('text', { nullable: true })
  currentSessionId?: string;

  @Column('text', { nullable: true })
  resetPasswordToken?: string;

  @Column('datetime', { nullable: true })
  resetPasswordExpires?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Class, (c) => c.teacher)
  teacherClasses: Class[];

  @OneToMany(() => Assignment, (a) => a.createdBy)
  assignments: Assignment[];
}
