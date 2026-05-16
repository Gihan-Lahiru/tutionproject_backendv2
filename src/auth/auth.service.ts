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
    const { email, password, name, role, grade, institute } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      id: uuid(),
      email,
      password: hashedPassword,
      name,
      role: role || 'student',
      grade,
      institute,
    });

    await this.userRepository.save(user);

    if ((user.role || 'student') === 'student' && user.grade) {
      void this.ensureAllDefaultGradeClasses().catch((error) => {
        console.warn('Failed to prepare default grade classes:', error);
      });
      void this.ensureDefaultGradeClassesAndEnrollStudent(user).catch((error) => {
        console.warn('Failed to enroll student in default classes:', error);
      });
    }

    // Generate verification code and save to user
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = verificationCode;
    user.emailVerified = false;
    await this.userRepository.save(user);

    void this.sendVerificationEmail(user, verificationCode).catch((error) => {
      console.warn('Failed to send verification email:', error);
    });

    return {
      message: 'Registration created. Please verify your email to continue.',
      userId: user.id,
    };
  }

  async resendVerificationCode(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = verificationCode;
    user.emailVerified = false;
    await this.userRepository.save(user);

    void this.sendVerificationEmail(user, verificationCode).catch((error) => {
      console.warn('Failed to send verification email:', error);
    });

    return { message: 'Verification code sent. Please verify your email to continue.' };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    user.emailVerified = true;
    user.emailVerificationCode = null;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
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

    if (user.emailVerificationCode && !user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        grade: user.grade,
        institute: user.institute,
      },
    };
  }

  async validateUser(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  private async sendVerificationEmail(user: User, verificationCode: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Tuition Sir - Verify your email',
        text: `Hello ${user.name},\n\nYour verification code is: ${verificationCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <h2 style="margin: 0 0 12px;">Welcome to Tuition Sir</h2>
            <p>Hello ${user.name},</p>
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
