import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // temporary debug log to inspect payload during development
    // remove this log after debugging is complete
    // eslint-disable-next-line no-console
    console.log('[JwtStrategy] payload:', payload);
    return { 
      id: payload.id, 
      email: payload.email, 
      role: payload.role, 
      approvalStatus: payload.approvalStatus,
      name: payload.name,
      grade: payload.grade 
    };
  }
}
