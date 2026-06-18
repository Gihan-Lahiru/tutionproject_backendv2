import { Injectable, UnauthorizedException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../database/entities/user.entity';
import { Class } from '../database/entities/class.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService implements OnModuleInit {
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
      relations: { students: true },
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

  // In-memory rate limiting map
  private readonly resetRequests = new Map<string, number[]>();

  async onModuleInit() {
    try {
      await this.userRepository.query('ALTER TABLE `users` ADD COLUMN `resetPasswordToken` TEXT NULL');
      console.log('Successfully checked/added resetPasswordToken column to users table.');
    } catch (e) {
      // Column already exists or table doesn't support ALTER
    }
    try {
      await this.userRepository.query('ALTER TABLE `users` ADD COLUMN `resetPasswordExpires` DATETIME NULL');
      console.log('Successfully checked/added resetPasswordExpires column to users table.');
    } catch (e) {
      // Column already exists or table doesn't support ALTER
    }
  }

  async forgotPassword(dto: ForgotPasswordDto, ip: string) {
    const email = dto.email.trim().toLowerCase();
    const rateKey = `${ip}:${email}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 mins
    const limit = 3; // max 3 requests per 15 minutes

    const timestamps = this.resetRequests.get(rateKey) || [];
    const relevantTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (relevantTimestamps.length >= limit) {
      throw new BadRequestException('Too many password reset requests. Please wait 15 minutes before trying again.');
    }

    relevantTimestamps.push(now);
    this.resetRequests.set(rateKey, relevantTimestamps);

    const user = await this.userRepository.findOne({ where: { email } });
    
    // Generic response message to prevent email enumeration
    const successResponse = {
      message: 'If this email is registered in our system, you will receive a password reset code shortly.',
    };

    if (!user) {
      return successResponse;
    }

    // Generate unique secure 6-digit code and expiry time
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = code;
    user.resetPasswordExpires = new Date(now + 15 * 60 * 1000); // 15 minutes from now

    await this.userRepository.save(user);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Tuition Sir - Password Reset Code',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 10px; color: #1f2937;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <div style="background-color: #2563eb; padding: 30px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Tuition Sir</h1>
              </div>
              <div style="padding: 40px 30px; line-height: 1.6;">
                <p style="font-size: 16px; margin-top: 0; color: #1f2937;">Hello ${user.name || 'User'},</p>
                <p style="font-size: 15px; color: #4b5563;">We received a request to reset the password for your account. Please use the following 6-digit verification code to complete your password reset:</p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <span style="display: inline-block; background-color: #f3f4f6; border: 1px solid #e5e7eb; color: #2563eb; font-size: 36px; font-weight: 800; letter-spacing: 6px; padding: 12px 30px; border-radius: 8px;">${code}</span>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; background-color: #f9fafb; padding: 15px; border-left: 4px solid #ef4444; border-radius: 4px;">
                  <strong>Important:</strong> This password reset code is only valid for 15 minutes. For security, please complete your reset promptly.
                </p>
                
                <p style="font-size: 13px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                  If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.warn('Failed to send password reset email:', error);
      // We still return successResponse to avoid leaking email presence
    }

    return successResponse;
  }

  async validateResetToken(email: string, code: string) {
    if (!email || !code) {
      throw new BadRequestException('Email and code parameters are required.');
    }

    const user = await this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || user.resetPasswordToken !== code || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired password reset code.');
    }

    return { valid: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || user.resetPasswordToken !== dto.code || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired password reset code.');
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    // Update credentials and invalidate the token immediately
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return {
      message: 'Password has been reset successfully. You can now login with your new credentials.',
    };
  }
}
