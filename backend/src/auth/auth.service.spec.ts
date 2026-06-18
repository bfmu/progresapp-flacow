import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

// Mock bcryptjs at the module level so we can verify it's NOT called
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcryptjs from 'bcryptjs';

const mockUserRole: Role = { id: 1, name: 'user', users: [] } as Role;

function makeUser(overrides: Partial<User> = {}): User {
  const u = new User();
  u.id = 1;
  u.full_name = 'Test User';
  u.email = 'test@example.com';
  u.password = 'hashed-password';
  u.googleId = null;
  u.roles = [mockUserRole];
  return Object.assign(u, overrides);
}

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            findOneByEmailWithPassword: jest.fn(),
            findOrCreateByGoogle: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:4321'),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── login() — null-password guard (R4.1) ──────────────────────────────────

  describe('login()', () => {
    it('throws BadRequestException with error google_only when user.password is null', async () => {
      const googleOnlyUser = makeUser({ password: null });
      usersService.findOneByEmailWithPassword.mockResolvedValue(googleOnlyUser);

      let caught: BadRequestException | undefined;
      try {
        await service.login({ email: 'test@example.com', password: 'anything' });
      } catch (err) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(BadRequestException);
      expect((caught as any).response.error).toBe('google_only');
    });

    it('does NOT call bcryptjs.compare when user.password is null', async () => {
      const googleOnlyUser = makeUser({ password: null });
      usersService.findOneByEmailWithPassword.mockResolvedValueOnce(googleOnlyUser);

      try {
        await service.login({ email: 'test@example.com', password: 'anything' });
      } catch {
        // expected
      }

      expect(bcryptjs.compare).not.toHaveBeenCalled();
    });

    it('returns accessToken for valid password (regression)', async () => {
      const user = makeUser({ password: 'hashed-password' });
      usersService.findOneByEmailWithPassword.mockResolvedValueOnce(user);
      (bcryptjs.compare as jest.Mock).mockResolvedValueOnce(true);
      jwtService.signAsync.mockResolvedValueOnce('jwt-token');

      const result = await service.login({ email: 'test@example.com', password: 'plaintext' });

      expect(result).toEqual({ accessToken: 'jwt-token' });
    });
  });

  // ─── signToken() ────────────────────────────────────────────────────────────

  describe('signToken()', () => {
    it('produces JWT payload with shape { email, sub, roles }', async () => {
      const user = makeUser({ id: 42, email: 'payload@example.com', roles: [mockUserRole] });
      jwtService.signAsync.mockResolvedValueOnce('signed-token');

      const result = await service.signToken(user);

      expect(result).toEqual({ accessToken: 'signed-token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: 'payload@example.com',
        sub: 42,
        roles: ['user'],
      });
    });

    it('maps multiple roles correctly', async () => {
      const adminRole: Role = { id: 2, name: 'admin', users: [] } as Role;
      const user = makeUser({ id: 1, roles: [mockUserRole, adminRole] });
      jwtService.signAsync.mockResolvedValueOnce('multi-role-token');

      await service.signToken(user);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ roles: ['user', 'admin'] }),
      );
    });
  });
});
