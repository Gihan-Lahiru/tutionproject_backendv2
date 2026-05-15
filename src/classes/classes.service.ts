import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../database/entities/class.entity';
import { User } from '../database/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createClassDto: CreateClassDto, userId: string) {
    const newClass = this.classRepository.create({
      id: uuid(),
      ...createClassDto,
      teacherId: userId,
    });
    return this.classRepository.save(newClass);
  }

  async findAll() {
    return this.classRepository.find({
      relations: ['teacher', 'students'],
    });
  }

  async findById(id: string) {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['teacher', 'students', 'assignments', 'notes'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return classEntity;
  }

  async update(id: string, updateClassDto: UpdateClassDto, userId: string) {
    const classEntity = await this.findById(id);

    if (classEntity.teacherId !== userId) {
      throw new ForbiddenException('You do not have permission to update this class');
    }

    Object.assign(classEntity, updateClassDto);
    return this.classRepository.save(classEntity);
  }

  async delete(id: string, userId: string) {
    const classEntity = await this.findById(id);

    if (classEntity.teacherId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this class');
    }

    await this.classRepository.remove(classEntity);
    return { message: 'Class deleted successfully' };
  }

  async getStudents(classId: string) {
    const classEntity = await this.findById(classId);
    return classEntity.students;
  }

  async enrollStudent(classId: string, studentId: string) {
    const classEntity = await this.findById(classId);
    const student = await this.userRepository.findOne({ where: { id: studentId } });
    
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!classEntity.students) {
      classEntity.students = [];
    }

    // Check if already enrolled
    const alreadyEnrolled = classEntity.students.some((s) => s.id === studentId);
    if (alreadyEnrolled) {
      return { message: 'Student already enrolled in this class' };
    }

    classEntity.students.push(student);
    await this.classRepository.save(classEntity);
    
    return { message: 'Student enrolled successfully' };
  }
}
