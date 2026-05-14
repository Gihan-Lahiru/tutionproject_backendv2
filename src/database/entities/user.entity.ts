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

  @Column('text', { default: 'active' })
  status: string; // active, inactive, suspended

  @Column('text', { nullable: true })
  currentSessionId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Class, (c) => c.teacher)
  teacherClasses: Class[];

  @OneToMany(() => Assignment, (a) => a.createdBy)
  assignments: Assignment[];
}
