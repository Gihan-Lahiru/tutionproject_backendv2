import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('papers')
export class Paper {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  grade: string;

  @Column('text', { default: 'Paper' })
  type: string;

  @Column('text', { nullable: true })
  topic?: string;

  @Column('text', { nullable: true })
  classId?: string;

  @Column('text')
  fileUrl: string;

  @Column('text', { nullable: true })
  originalName?: string;

  @Column('text', { nullable: true })
  filePublicId?: string;

  @Column('text', { nullable: true })
  teacherId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('integer', { default: 0 })
  downloads: number;
}
