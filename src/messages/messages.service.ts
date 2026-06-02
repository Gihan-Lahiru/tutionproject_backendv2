import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../database/entities/message.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
  ) {}

  async create(studentId: string, message: string) {
    const newMessage = this.messageRepository.create({
      id: uuid(),
      studentId,
      message,
    });
    return this.messageRepository.save(newMessage);
  }

  async findAll() {
    return this.messageRepository.find({
      relations: { student: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: string) {
    return this.messageRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async reply(id: string, adminReply: string) {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');

    message.adminReply = adminReply;
    message.status = 'replied';
    return this.messageRepository.save(message);
  }
}
