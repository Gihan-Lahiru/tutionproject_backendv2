import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('payments')
export class Payment {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  userId: string;

  @Column('text', { nullable: true })
  classId?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('text', { default: 'pending' })
  status: string; // pending, completed, failed

  @Column('text', { nullable: true })
  method?: string; // credit_card, paypal, payhere

  @Column('text', { nullable: true })
  receiptUrl?: string;

  @Column('text', { default: 'pending' })
  approvalStatus: string; // pending, approved, rejected

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;
}
