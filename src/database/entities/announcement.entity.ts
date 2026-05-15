import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { User } from './user.entity';

@Entity('announcements')
export class Announcement {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  classId: string;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  createdById?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  class: Class;

  @ManyToOne(() => User, { nullable: true })
  createdBy?: User;
}
