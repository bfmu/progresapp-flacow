import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Profile } from 'passport-google-oauth20';

// Mock passport-google-oauth20 Strategy so it doesn't make real HTTP calls in ctor
jest.mock('passport-google-oauth20', () => {
  return {
    Strategy: class MockGooglePassportStrategy {
      constructor(_options: any) {}
    },
  };
});

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'google-id-123',
    displayName: 'Test User',
    emails: [{ value: 'test@example.com', verified: 'true' }],
    name: { givenName: 'Test', familyName: 'User' },
    photos: [],
    provider: 'google',
    _raw: '',
    _json: {} as any,
    ...overrides,
  } as Profile;
}

function makeUser(): User {
  const u = new User();
  u.id = 1;
  u.full_name = 'Test User';
  u.email = 'test@example.com';
  u.googleId = 'google-id-123';
  u.roles = [{ id: 1, name: 'user', users: [] } as Role];
  return u;
}

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOrCreateByGoogle: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate()', () => {
    it('calls done with BadRequestException when profile has no email', async () => {
      const profileNoEmail = makeProfile({ emails: [] });
      const done = jest.fn();

      await strategy.validate('access', 'refresh', profileNoEmail, done);

      expect(done).toHaveBeenCalledTimes(1);
      const [error, result] = done.mock.calls[0];
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getResponse()).toMatchObject({
        error: 'google_no_email',
      });
      expect(result).toBe(false);
    });

    it('calls done with BadRequestException when profile emails is undefined', async () => {
      const profileNoEmail = makeProfile({ emails: undefined });
      const done = jest.fn();

      await strategy.validate('access', 'refresh', profileNoEmail, done);

      expect(done).toHaveBeenCalledTimes(1);
      const [error, result] = done.mock.calls[0];
      expect(error).toBeInstanceOf(BadRequestException);
      expect(result).toBe(false);
    });

    it('calls findOrCreateByGoogle with correct args and calls done(null, user) on success', async () => {
      const profile = makeProfile();
      const user = makeUser();
      usersService.findOrCreateByGoogle.mockResolvedValue(user);
      const done = jest.fn();

      await strategy.validate('access', 'refresh', profile, done);

      expect(usersService.findOrCreateByGoogle).toHaveBeenCalledWith(
        'google-id-123',
        'test@example.com',
        'Test User',
      );
      expect(done).toHaveBeenCalledWith(null, user);
    });

    it('uses displayName as fullName when available', async () => {
      const profile = makeProfile({ displayName: 'Display Name' });
      const user = makeUser();
      usersService.findOrCreateByGoogle.mockResolvedValue(user);
      const done = jest.fn();

      await strategy.validate('access', 'refresh', profile, done);

      expect(usersService.findOrCreateByGoogle).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'Display Name',
      );
    });

    it('falls back to givenName when displayName is undefined', async () => {
      const profile = makeProfile({
        displayName: undefined,
        name: { givenName: 'GivenOnly', familyName: '' },
      });
      const user = makeUser();
      usersService.findOrCreateByGoogle.mockResolvedValue(user);
      const done = jest.fn();

      await strategy.validate('access', 'refresh', profile, done);

      expect(usersService.findOrCreateByGoogle).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'GivenOnly',
      );
    });

    it('falls back to email prefix when displayName and givenName are both absent', async () => {
      const profile = makeProfile({
        displayName: undefined,
        name: undefined,
      });
      const user = makeUser();
      usersService.findOrCreateByGoogle.mockResolvedValue(user);
      const done = jest.fn();

      await strategy.validate('access', 'refresh', profile, done);

      expect(usersService.findOrCreateByGoogle).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'test', // email.split('@')[0] for test@example.com
      );
    });
  });
});
