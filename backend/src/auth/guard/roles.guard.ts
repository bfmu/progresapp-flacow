import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario, el token es inválido o no está autenticado
    if (!user) {
      throw new UnauthorizedException({
        error: 'invalid_token',
        message: 'Token is missing or invalid.',
      });
    }

    if (user.roles?.some((role) => role === 'admin')) {
      return true;
    }

    const haveRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!haveRole) {
      throw new ForbiddenException({
        error: 'insufficient_permissions',
        message: 'You do not have permission to access this resource.',
      });
    }

    return true;
  }
}
