import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('videos')
export class Video {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  videoUrl: string;

  @Column('text', { nullable: true })
  thumbnailUrl?: string;

  @Column('text', { nullable: true })
  grade?: string;

  @Column('text', { nullable: true })
  subject?: string;

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
