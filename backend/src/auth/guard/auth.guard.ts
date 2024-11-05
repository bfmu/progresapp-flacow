import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstans } from '../constants/jwt.constant';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        error: 'token_missing',
        message: 'Token is missing.',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstans.secret,
      });

      request['user'] = payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          error: 'token_expired',
          message: 'Token has expired.',
        });
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          error: 'invalid_token',
          message: 'Token is invalid.',
        });
      } else {
        throw new UnauthorizedException({
          error: 'unknown_error',
          message: 'An unknown error occurred during token verification.',
        });
      }
    }
    // Si el token es valido entonces tiene que retornar true
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
