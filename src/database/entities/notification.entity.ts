import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  userId: string;

  @Column('text')
  type: string;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  relatedPaymentId?: string;

  @Column('integer', { default: 0 })
  read: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;
}
