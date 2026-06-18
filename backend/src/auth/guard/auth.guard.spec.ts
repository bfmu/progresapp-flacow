import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { ExecutionContext } from '@nestjs/common';

const JWT_TEST_SECRET = 'test-secret';

function buildMockContext(authHeader?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: authHeader,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(JWT_TEST_SECRET),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('missing token', () => {
    it('throws UnauthorizedException with code token_missing when no Authorization header', async () => {
      const context = buildMockContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );

      try {
        await guard.canActivate(context);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.response.error).toBe('token_missing');
      }
    });

    it('throws UnauthorizedException with code token_missing when Authorization is not Bearer', async () => {
      const context = buildMockContext('Basic abc123');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );

      try {
        await guard.canActivate(context);
      } catch (err) {
        expect(err.response.error).toBe('token_missing');
      }
    });
  });

  describe('expired token', () => {
    it('throws UnauthorizedException with code token_expired', async () => {
      const expiredError = new Error('TokenExpiredError');
      expiredError.name = 'TokenExpiredError';
      (jwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(expiredError);

      const context = buildMockContext('Bearer some-expired-token');

      try {
        await guard.canActivate(context);
        fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.response.error).toBe('token_expired');
      }
    });
  });

  describe('invalid token', () => {
    it('throws UnauthorizedException with code invalid_token for JsonWebTokenError', async () => {
      const invalidError = new Error('JsonWebTokenError');
      invalidError.name = 'JsonWebTokenError';
      (jwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(invalidError);

      const context = buildMockContext('Bearer bad-token');

      try {
        await guard.canActivate(context);
        fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.response.error).toBe('invalid_token');
      }
    });
  });

  describe('valid token', () => {
    it('returns true and attaches user payload to request when token is valid', async () => {
      const fakePayload = { email: 'user@example.com', sub: 1, roles: ['user'] };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValueOnce(fakePayload);

      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(fakePayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: JWT_TEST_SECRET,
      });
    });

    it('reads JWT_SECRET from ConfigService', async () => {
      const fakePayload = { email: 'user@example.com', sub: 1, roles: ['user'] };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValueOnce(fakePayload);

      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      await guard.canActivate(context);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-token',
        expect.objectContaining({ secret: JWT_TEST_SECRET }),
      );
    });
  });
});
