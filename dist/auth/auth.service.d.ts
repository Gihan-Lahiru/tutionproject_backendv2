import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Class } from '../database/entities/class.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private userRepository;
    private classRepository;
    private jwtService;
    private readonly defaultGrades;
    private readonly defaultClassTemplates;
    constructor(userRepository: Repository<User>, classRepository: Repository<Class>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        userId: string;
    }>;
    private normalizeGrade;
    private ensureDefaultGradeClassesAndEnrollStudent;
    private ensureAllDefaultGradeClasses;
    private findClassByNormalizedGradeTemplate;
    private createDefaultClass;
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            grade: string;
            institute: string;
        };
    }>;
    validateUser(id: string): Promise<User>;
}
//# sourceMappingURL=auth.service.d.ts.map