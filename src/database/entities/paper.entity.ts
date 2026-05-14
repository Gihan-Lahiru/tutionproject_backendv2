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

  @Column('text')
  fileUrl: string;

  @Column('text', { nullable: true })
  filePublicId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
