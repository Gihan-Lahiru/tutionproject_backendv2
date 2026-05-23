import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        approvalStatus: string;
        role: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            grade: string;
            institute: string;
            approvalStatus: string;
        };
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void>;
    resendVerificationCode(resendVerificationDto: ResendVerificationDto): Promise<void>;
    getCurrentUser(req: Request): Promise<Express.User>;
}
//# sourceMappingURL=auth.controller.d.ts.map