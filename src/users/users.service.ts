import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  private async evaluateDashboardAccess(user: User): Promise<User> {
    if (!user) return user;
    let newAccess = true;

    if (user.role === 'student' && user.createdAt) {
      const gracePeriodDays = 14;
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysSinceRegistration = (Date.now() - user.createdAt.getTime()) / msPerDay;

      if (daysSinceRegistration <= gracePeriodDays) {
        newAccess = true;
      } else {
        newAccess = user.paymentStatus === 'paid';
      }
    }

    if (user.dashboardAccess !== newAccess) {
      user.dashboardAccess = newAccess;
      await this.userRepository.save(user);
    }
    return user;
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.evaluateDashboardAccess(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ? this.evaluateDashboardAccess(user) : null;
  }

  async create(userData: any) {
    const password = userData.password || '12345678';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: any) {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async findByRole(role: string, status?: string) {
    if (status) {
      return this.userRepository.find({ where: { role, approvalStatus: status } });
    }
    return this.userRepository.find({ where: { role } });
  }

  async approve(id: string) {
    const user = await this.findById(id);
    user.approvalStatus = 'approved';
    user.status = 'active'; // Also mark as active
    return this.userRepository.save(user);
  }

  async reject(id: string, reason?: string) {
    const user = await this.findById(id);
    user.approvalStatus = 'rejected';
    user.status = 'inactive'; // Mark as inactive when rejected
    return this.userRepository.save(user);
  }

  async delete(id: string) {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
}
