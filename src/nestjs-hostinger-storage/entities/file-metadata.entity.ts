import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('file_metadata')
export class FileMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  generatedName: string;

  @Column()
  publicUrl: string;

  @Column()
  uploadType: string; // e.g., 'profile-pictures', 'notes', 'assignments'

  @Column({ type: 'int' })
  sizeBytes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
