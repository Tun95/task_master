import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // If user is admin, allow access
    if (user.role === 'ADMIN') {
      return true;
    }

    // If route requires ADMIN but user is not admin, deny access
    if (requiredRoles.includes('ADMIN') && user.role !== 'ADMIN') {
      return false;
    }

    // For user routes, allow if user owns the resource
    // This would need additional logic based on the request params

    return true;
  }
}
