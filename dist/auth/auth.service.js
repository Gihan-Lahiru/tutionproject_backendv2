"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../database/entities/user.entity");
const class_entity_1 = require("../database/entities/class.entity");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(userRepository, classRepository, jwtService, mailerService) {
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
        this.defaultGrades = ['6', '7', '8', '9', '10', '11', '12', '13'];
        this.defaultClassTemplates = [
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
    }
    async register(registerDto) {
        const { email, password, name, role, grade, institute } = registerDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            id: (0, uuid_1.v4)(),
            email,
            password: hashedPassword,
            name,
            role: role || 'student',
            grade,
            institute,
        });
        await this.userRepository.save(user);
        if ((user.role || 'student') === 'student' && user.grade) {
            await this.ensureAllDefaultGradeClasses();
            await this.ensureDefaultGradeClassesAndEnrollStudent(user);
        }
        // Generate verification code and save to user
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationCode = verificationCode;
        user.emailVerified = false;
        await this.userRepository.save(user);
        // Try to send verification email; if sending fails, return code in response for testing
        let mailSent = false;
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Welcome to Tuition Sir - Verify your email',
                text: `Hello ${user.name},\n\nYour verification code is: ${verificationCode}`,
            });
            mailSent = true;
        }
        catch (e) {
            console.warn('Failed to send verification email:', e);
        }
        const response = { message: 'User registered successfully', userId: user.id };
        if (!mailSent)
            response.verificationCode = verificationCode;
        return response;
    }
    async verifyEmail(email, code) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.emailVerified) {
            return { message: 'Email already verified' };
        }
        if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
            throw new common_1.BadRequestException('Invalid verification code');
        }
        user.emailVerified = true;
        user.emailVerificationCode = null;
        await this.userRepository.save(user);
        return { message: 'Email verified successfully' };
    }
    normalizeGrade(value) {
        const raw = String(value || '').trim();
        if (!raw)
            return '';
        return raw.replace(/^grade\s*/i, '').trim();
    }
    async ensureDefaultGradeClassesAndEnrollStudent(student) {
        const normalizedGrade = this.normalizeGrade(student.grade);
        if (!normalizedGrade)
            return;
        for (const template of this.defaultClassTemplates) {
            let classEntity = await this.findClassByNormalizedGradeTemplate(normalizedGrade, template.subject, template.location);
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
    async ensureAllDefaultGradeClasses() {
        for (const grade of this.defaultGrades) {
            for (const template of this.defaultClassTemplates) {
                const existing = await this.findClassByNormalizedGradeTemplate(grade, template.subject, template.location);
                if (!existing) {
                    await this.createDefaultClass(grade, template);
                }
            }
        }
    }
    async findClassByNormalizedGradeTemplate(normalizedGrade, subject, location) {
        const candidates = await this.classRepository.find({
            where: { subject, location },
            relations: ['students'],
        });
        return (candidates.find((entry) => this.normalizeGrade(entry.grade) === normalizedGrade) || null);
    }
    async createDefaultClass(normalizedGrade, template) {
        const newClass = this.classRepository.create({
            id: (0, uuid_1.v4)(),
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
        return { ...saved, students: [] };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.emailVerificationCode && !user.emailVerified) {
            throw new common_1.UnauthorizedException('Please verify your email before logging in');
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
    async validateUser(id) {
        return this.userRepository.findOne({ where: { id } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        mailer_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map