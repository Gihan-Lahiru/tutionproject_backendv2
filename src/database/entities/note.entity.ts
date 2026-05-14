import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { User } from './user.entity';

@Entity('notes')
export class Note {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  title: string;

  @Column('text', { nullable: true })
  classId?: string;

  @Column('text', { nullable: true })
  fileUrl?: string;

  @Column('text', { nullable: true })
  fileType?: string;

  @Column('text', { nullable: true })
  uploadedBy?: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Class, (c) => c.notes)
  class: Class;

  @ManyToOne(() => User)
  uploader: User;
}
