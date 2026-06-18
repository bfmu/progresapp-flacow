import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/roles/entities/role.entity';

const mockUserRole: Role = { id: 1, name: 'user', users: [] } as Role;

function makeUser(overrides: Partial<User> = {}): User {
  const u = new User();
  u.id = 1;
  u.full_name = 'Test User';
  u.email = 'test@example.com';
  u.password = 'hashed';
  u.googleId = null;
  u.roles = [mockUserRole];
  return Object.assign(u, overrides);
}

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;
  let rolesService: jest.Mocked<RolesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            findByName: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    rolesService = module.get(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── findOneByGoogleId ──────────────────────────────────────────────────────

  describe('findOneByGoogleId', () => {
    it('returns the user when found by googleId', async () => {
      const user = makeUser({ googleId: 'g-001' });
      userRepo.findOneBy.mockResolvedValueOnce(user);

      const result = await service.findOneByGoogleId('g-001');

      expect(result).toBe(user);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ googleId: 'g-001' });
    });

    it('returns null when no user has the given googleId', async () => {
      userRepo.findOneBy.mockResolvedValueOnce(null);

      const result = await service.findOneByGoogleId('g-nonexistent');

      expect(result).toBeNull();
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ googleId: 'g-nonexistent' });
    });
  });

  // ─── findOrCreateByGoogle ───────────────────────────────────────────────────

  describe('findOrCreateByGoogle', () => {
    it('Branch 1 (Scenario 1.C): returns existing user when found by googleId, no email lookup', async () => {
      const existingUser = makeUser({ googleId: 'g-003' });
      userRepo.findOneBy.mockResolvedValueOnce(existingUser); // findOneByGoogleId

      const result = await service.findOrCreateByGoogle('g-003', 'existing@example.com', 'Existing');

      expect(result).toBe(existingUser);
      // Only called once (for googleId lookup), not again for email
      expect(userRepo.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ googleId: 'g-003' });
    });

    it('Branch 2 (Scenario 1.B): found by email — sets googleId, preserves password and roles, saves', async () => {
      const existingByEmail = makeUser({
        googleId: null,
        email: 'existing@example.com',
        password: 'bcrypt-hash',
        roles: [mockUserRole],
      });
      const savedUser = makeUser({ ...existingByEmail, googleId: 'g-002' });

      // findOneByGoogleId -> null
      userRepo.findOneBy
        .mockResolvedValueOnce(null)        // googleId lookup
        .mockResolvedValueOnce(existingByEmail); // email lookup
      userRepo.save.mockResolvedValueOnce(savedUser);

      const result = await service.findOrCreateByGoogle('g-002', 'existing@example.com', 'Existing User');

      expect(result).toBe(savedUser);
      expect(existingByEmail.googleId).toBe('g-002');
      expect(existingByEmail.password).toBe('bcrypt-hash'); // password preserved
      expect(existingByEmail.roles).toEqual([mockUserRole]); // roles preserved
      expect(userRepo.save).toHaveBeenCalledWith(existingByEmail);
    });

    it('Branch 3 (Scenario 1.A): creates new user with role user, password null, correct name', async () => {
      userRepo.findOneBy
        .mockResolvedValueOnce(null) // googleId lookup
        .mockResolvedValueOnce(null); // email lookup
      rolesService.findByName.mockResolvedValueOnce(mockUserRole);
      const newUser = makeUser({ googleId: 'g-001', email: 'new@example.com', password: null, full_name: 'New User' });
      userRepo.save.mockResolvedValueOnce(newUser);

      const result = await service.findOrCreateByGoogle('g-001', 'new@example.com', 'New User');

      expect(result).toBe(newUser);
      expect(rolesService.findByName).toHaveBeenCalledWith('user');
      const savedArg = userRepo.save.mock.calls[0][0] as User;
      expect(savedArg.password).toBeNull();
      expect(savedArg.googleId).toBe('g-001');
      expect(savedArg.email).toBe('new@example.com');
      expect(savedArg.full_name).toBe('New User');
      expect(savedArg.roles).toEqual([mockUserRole]);
    });

    it('Branch 4 (R3.5): race condition — save throws unique violation, re-queries and returns winner', async () => {
      const winner = makeUser({ googleId: 'g-race', email: 'race@example.com' });
      userRepo.findOneBy
        .mockResolvedValueOnce(null) // initial googleId lookup
        .mockResolvedValueOnce(null) // email lookup
        .mockResolvedValueOnce(winner); // re-query after race
      rolesService.findByName.mockResolvedValueOnce(mockUserRole);

      const pgUniqueViolation = Object.assign(new Error('unique violation'), { code: '23505' });
      userRepo.save.mockRejectedValueOnce(pgUniqueViolation);

      const result = await service.findOrCreateByGoogle('g-race', 'race@example.com', 'Race User');

      expect(result).toBe(winner);
      expect(userRepo.findOneBy).toHaveBeenCalledTimes(3);
      // Last call is the re-query by googleId
      expect(userRepo.findOneBy).toHaveBeenLastCalledWith({ googleId: 'g-race' });
    });

    it('rethrows non-unique-violation errors', async () => {
      userRepo.findOneBy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      rolesService.findByName.mockResolvedValueOnce(mockUserRole);

      const dbError = new Error('Some other DB error');
      userRepo.save.mockRejectedValueOnce(dbError);

      await expect(
        service.findOrCreateByGoogle('g-err', 'err@example.com', 'Err User'),
      ).rejects.toThrow('Some other DB error');
    });
  });
});
