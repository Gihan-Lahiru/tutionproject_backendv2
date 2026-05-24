import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/entities/user.entity';
import { Class } from '../database/entities/class.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  private readonly defaultGrades = ['6', '7', '8', '9', '10', '11', '12', '13'];

  private readonly defaultClassTemplates = [
    {
      subject: 'Science',
      day: 'Tuesday',
      time: '4.00pm-7.00pm',
      location: 'Prebhashi Hettipola',
    },
    {
      subject: 'Science',
      day: 'Thursday',
      time: '4.00pm-7.00pm',
      location: 'Focus Hadungamuwa',
    },
  ];

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Class) private classRepository: Repository<Class>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, role, grade, institute, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      if (existingUser.approvalStatus === 'pending') {
        throw new BadRequestException('Your registration has already been submitted and is awaiting teacher approval. Please wait for approval.');
      }
      throw new BadRequestException('This email is already registered. Please login.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedRole = role || 'student';
    const approvalStatus = normalizedRole === 'student' ? 'pending' : 'approved';

    // Create user with role-specific approval status
    const user = this.userRepository.create({
      id: uuid(),
      email,
      password: hashedPassword,
      name,
      role: normalizedRole,
      phone,
      grade,
      institute,
      emailVerified: true, // Email is verified (we trust registration)
      approvalStatus,
      status: 'active',
    });

    await this.userRepository.save(user);

    // Enroll student in default classes if needed (background task)
    if ((user.role || 'student') === 'student' && user.grade) {
      void this.ensureAllDefaultGradeClasses().catch((error) => {
        console.warn('Failed to prepare default grade classes:', error);
      });
      void this.ensureDefaultGradeClassesAndEnrollStudent(user).catch((error) => {
        console.warn('Failed to enroll student in default classes:', error);
      });
    }

    return {
      message:
        approvalStatus === 'pending'
          ? 'Registration submitted. Awaiting teacher approval.'
          : 'Registration completed successfully.',
      approvalStatus,
      role: normalizedRole,
    };
  }

  async resendVerificationCode(email: string) {
    // This endpoint is no longer used in the new flow
    throw new BadRequestException('This endpoint is deprecated. Please wait for teacher approval.');
  }

  async verifyEmail(email: string, code: string) {
    // This endpoint is no longer used in the new flow
    throw new BadRequestException('This endpoint is deprecated. Please wait for teacher approval.');
  }

  private normalizeGrade(value?: string) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return raw.replace(/^grade\s*/i, '').trim();
  }

  private async ensureDefaultGradeClassesAndEnrollStudent(student: User) {
    const normalizedGrade = this.normalizeGrade(student.grade);
    if (!normalizedGrade) return;

    for (const template of this.defaultClassTemplates) {
      let classEntity = await this.findClassByNormalizedGradeTemplate(
        normalizedGrade,
        template.subject,
        template.location,
      );

      if (!classEntity) {
        classEntity = await this.createDefaultClass(normalizedGrade, template);
      }

      classEntity.students = classEntity.students || [];
      const alreadyEnrolled = classEntity.students.some((s) => s.id === student.id);
      if (!alreadyEnrolled) {
        classEntity.students.push(student);
        await this.classRepository.save(classEntity);
      }
    }
  }

  private async ensureAllDefaultGradeClasses() {
    for (const grade of this.defaultGrades) {
      for (const template of this.defaultClassTemplates) {
        const existing = await this.findClassByNormalizedGradeTemplate(
          grade,
          template.subject,
          template.location,
        );

        if (!existing) {
          await this.createDefaultClass(grade, template);
        }
      }
    }
  }

  private async findClassByNormalizedGradeTemplate(
    normalizedGrade: string,
    subject: string,
    location: string,
  ) {
    const candidates = await this.classRepository.find({
      where: { subject, location },
      relations: ['students'],
    });

    return (
      candidates.find((entry) => this.normalizeGrade(entry.grade) === normalizedGrade) || null
    );
  }

  private async createDefaultClass(
    normalizedGrade: string,
    template: { subject: string; day: string; time: string; location: string },
  ) {
    const newClass = this.classRepository.create({
      id: uuid(),
      name: `${template.subject} - Grade ${normalizedGrade}`,
      title: `${template.subject} Grade ${normalizedGrade}`,
      grade: normalizedGrade,
      subject: template.subject,
      day: template.day,
      time: template.time,
      description: `${template.subject} Grade ${normalizedGrade}`,
      location: template.location,
    });

    const saved = await this.classRepository.save(newClass);
    return { ...saved, students: [] as User[] };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Only students need approval. Teachers and admins can login immediately
    if (user.role === 'student') {
      if (user.approvalStatus === 'pending') {
        throw new UnauthorizedException('Your account is currently pending approval. Please wait until your teacher confirms your account before logging in.');
      }
      if (user.approvalStatus === 'rejected') {
        throw new UnauthorizedException('Your account request was rejected. Please contact the teacher.');
      }
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
      name: user.name,
      grade: user.grade,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        grade: user.grade,
        institute: user.institute,
        approvalStatus: user.approvalStatus,
      },
    };
  }

  async validateUser(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  private async sendVerificationEmail(userData: { email: string; name: string }, verificationCode: string) {
    try {
      await this.mailerService.sendMail({
        to: userData.email,
        subject: 'Welcome to Tuition Sir - Verify your email',
        text: `Hello ${userData.name},\n\nYour verification code is: ${verificationCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <h2 style="margin: 0 0 12px;">Welcome to Tuition Sir</h2>
            <p>Hello ${userData.name},</p>
            <p>Your verification code is:</p>
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${verificationCode}</div>
            <p>If you did not request this, you can ignore this email.</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.warn('Failed to send verification email:', error);
      return false;
    }
  }
}
