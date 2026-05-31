import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  studentId: string;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  adminReply: string;

  @Column('text', { default: 'unread' })
  status: string; // unread, read, replied

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;
}
