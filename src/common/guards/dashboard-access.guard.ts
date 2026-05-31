import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class DashboardAccessGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user;
    
    if (!jwtUser) return true; // Handled by JwtAuthGuard
    if (jwtUser.role !== 'student') return true;

    const user = await this.usersService.findById(jwtUser.id);
    if (!user) return true;

    if (!user.dashboardAccess) {
      throw new ForbiddenException('Payment overdue. Access restricted.');
    }

    // Dynamic payment access check
    if (user.paymentDueDate && user.paymentStatus !== 'paid') {
      const today = new Date();
      const dueDate = new Date(user.paymentDueDate);
      
      if (today > dueDate) {
        throw new ForbiddenException('Payment overdue. Please clear your dues to access learning materials.');
      }
    }

    return true;
  }
}
