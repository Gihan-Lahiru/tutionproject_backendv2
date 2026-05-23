import { Injectable, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Please login to access this resource');
    }

    const req = context.switchToHttp().getRequest();
    req.user = user;

    if (req.user.role === 'student' && req.user.approvalStatus === 'pending') {
      throw new ForbiddenException('Your account is pending approval.');
    }

    return user;
  }
}
