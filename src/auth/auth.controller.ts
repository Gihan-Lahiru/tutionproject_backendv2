import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.email, verifyEmailDto.code);
  }

  @Post('resend-verification-code')
  async resendVerificationCode(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerificationCode(resendVerificationDto.email);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Req() req: Request) {
    return req.user;
  }
}
