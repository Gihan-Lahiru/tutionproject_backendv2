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

    const savedUser = (await this.userRepository.save(user)) as unknown as User;

    // Handle Class enrollment for student creation
    if (savedUser.role === 'student' && userData.tuition_class) {
      const classId = userData.tuition_class;
      const manager = this.userRepository.manager;
      const targetClass = await manager.query('SELECT id FROM classes WHERE id = ?', [classId]);
      if (targetClass && targetClass.length > 0) {
        await manager.query('INSERT INTO class_students (classesId, usersId) VALUES (?, ?)', [classId, savedUser.id]);
      }
    }

    return savedUser;
  }

  async update(id: string, updateUserDto: any) {
    const user = await this.findById(id);
    
    // Handle Class enrollment if tuition_class is updated for a student
    if (user.role === 'student' && 'tuition_class' in updateUserDto) {
      const classId = updateUserDto.tuition_class;
      
      // Get entity manager to directly update the class_students relation table
      const manager = this.userRepository.manager;
      
      // Remove student from all classes first to ensure clean reassignment
      await manager.query('DELETE FROM class_students WHERE usersId = ?', [id]);
      
      // If a valid class is chosen, enroll them
      if (classId) {
        // Double check class exists
        const targetClass = await manager.query('SELECT id FROM classes WHERE id = ?', [classId]);
        if (targetClass && targetClass.length > 0) {
          await manager.query('INSERT INTO class_students (classesId, usersId) VALUES (?, ?)', [classId, id]);
        }
      }
    }

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
