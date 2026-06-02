import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../database/entities/payment.entity';
import { User } from '../database/entities/user.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createPaymentDto: any) {
    const payment = this.paymentRepository.create({
      id: uuid(),
      ...createPaymentDto,
    });
    return this.paymentRepository.save(payment);
  }

  async uploadReceipt(userId: string, receiptUrl: string, body?: any) {
    const payment = this.paymentRepository.create({
      id: uuid(),
      userId,
      amount: body?.amount ? Number(body.amount) : 0, 
      status: 'pending',
      approvalStatus: 'pending',
      receiptUrl,
      method: body?.note || '', 
      month: body?.month,
      year: body?.year,
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.paymentStatus = 'pending_verification';
      await this.userRepository.save(user);
    }

    return this.paymentRepository.save(payment);
  }

  async approvePayment(id: string) {
    const payment = await this.findById(id);
    payment.approvalStatus = 'approved';
    payment.status = 'completed';

    const user = await this.userRepository.findOne({ where: { id: payment.userId } });
    if (user) {
      user.paymentStatus = 'paid';
      user.dashboardAccess = true;
      await this.userRepository.save(user);
    }

    return this.paymentRepository.save(payment);
  }

  async rejectPayment(id: string) {
    const payment = await this.findById(id);
    payment.approvalStatus = 'rejected';
    payment.status = 'failed';

    const user = await this.userRepository.findOne({ where: { id: payment.userId } });
    if (user) {
      user.paymentStatus = 'rejected';
      user.dashboardAccess = false;
      await this.userRepository.save(user);
    }

    return this.paymentRepository.save(payment);
  }

  async findByUser(userId: string) {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.paymentRepository.find({
      order: { createdAt: 'DESC' },
      relations: { user: true },
    });
  }

  async findPendingReceipts() {
    const pending = await this.paymentRepository.find({
      where: { approvalStatus: 'pending' },
      order: { createdAt: 'DESC' },
      relations: { user: true },
    });

    return {
      payments: pending.filter((payment) => Boolean(payment.receiptUrl)),
    };
  }

  async findById(id: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async update(id: string, updatePaymentDto: any) {
    const payment = await this.findById(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async updateStatus(id: string, status: string) {
    const payment = await this.findById(id);
    payment.status = status;
    return this.paymentRepository.save(payment);
  }
}
