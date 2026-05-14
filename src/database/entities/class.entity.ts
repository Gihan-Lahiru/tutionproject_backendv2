import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Assignment } from './assignment.entity';
import { Note } from './note.entity';

@Entity('classes')
export class Class {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  title?: string;

  @Column('text')
  grade: string;

  @Column('text')
  subject: string;

  @Column('text', { nullable: true })
  day?: string;

  @Column('text', { nullable: true })
  time?: string;

  @Column('integer', { nullable: true })
  fee?: number;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  location?: string;

  @Column('text', { nullable: true })
  teacherId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.teacherClasses)
  teacher: User;

  @ManyToMany(() => User)
  @JoinTable({ name: 'class_students' })
  students: User[];

  @OneToMany(() => Assignment, (a) => a.class)
  assignments: Assignment[];

  @OneToMany(() => Note, (n) => n.class)
  notes: Note[];
}
