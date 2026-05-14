import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../database/entities/payment.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: any) {
    const payment = this.paymentRepository.create({
      id: uuid(),
      ...createPaymentDto,
    });
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
    });
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
