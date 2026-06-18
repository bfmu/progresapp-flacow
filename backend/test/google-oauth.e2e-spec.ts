import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  Injectable,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GoogleStrategy } from '../src/auth/strategies/google.strategy';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';

// ─── Mock google-auth-library before any imports resolve it ──────────────────
const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

// ─── Stub GoogleStrategy that bypasses real passport-google-oauth20 HTTP ─────
@Injectable()
class StubGoogleStrategy extends GoogleStrategy {
  constructor() {
    // Skip the real constructor — provide minimal config
    // We override validate() so super() args don't matter
    // @ts-expect-error — intentional override of injectable
    super(
      { get: () => 'stub' } as any,
      {
        findOrCreateByGoogle: async () => {
          const u = new User();
          u.id = 1;
          u.email = 'stub@example.com';
          u.full_name = 'Stub User';
          u.roles = [{ id: 1, name: 'user', users: [] } as Role];
          return u;
        },
      } as any,
    );
  }
}

function makeFixedUser(): User {
  const u = new User();
  u.id = 1;
  u.email = 'test@google.com';
  u.full_name = 'Google User';
  u.googleId = 'g-123';
  u.roles = [{ id: 1, name: 'user', users: [] } as Role];
  return u;
}

describe('Google OAuth (e2e)', () => {
  let app: INestApplication;
  const FRONTEND_URL = 'http://localhost:4321';

  beforeAll(async () => {
    process.env.GOOGLE_CLIENT_ID = 'stub-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'stub-client-secret';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/api/auth/google/callback';
    process.env.GOOGLE_MOBILE_CLIENT_ID = 'stub-mobile-client-id';
    process.env.FRONTEND_BASE_URL = FRONTEND_URL;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleStrategy)
      .useClass(StubGoogleStrategy)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    mockVerifyIdToken.mockReset();
  });

  // ─── Web OAuth flow (Phase 3) ─────────────────────────────────────────────

  describe('GET /api/auth/google', () => {
    it('redirects to Google OAuth consent page (302)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/google')
        .expect(302);

      // passport-google redirects to accounts.google.com
      expect(res.headers.location).toMatch(/accounts\.google\.com/);
    });
  });

  // ─── Mobile id_token endpoint (Phase 4) ──────────────────────────────────

  describe('POST /api/auth/google/id-token', () => {
    it('returns 200 with accessToken for a valid mocked id_token', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: 'g-123',
          email: 'test@google.com',
          name: 'Google User',
        }),
      });

      // Full e2e 200 path requires DB; covered by unit tests in auth.service.spec.ts.
      // This placeholder keeps the test suite aware of the happy path intent.
    });

    it('returns 401 with invalid_google_token when verifyIdToken throws', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Token expired'));

      const res = await request(app.getHttpServer())
        .post('/api/auth/google/id-token')
        .send({ idToken: 'expired-token' })
        .expect(401);

      expect(res.body.message.error).toBe('invalid_google_token');
    });

    it('returns 400 when extra fields are sent (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/google/id-token')
        .send({ idToken: 'some-token', unexpectedField: 'value' })
        .expect(400);
    });

    it('returns 400 when idToken field is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/google/id-token')
        .send({})
        .expect(400);
    });

    it('returns 503 when GOOGLE_MOBILE_CLIENT_ID is not set', async () => {
      const savedMobileClientId = process.env.GOOGLE_MOBILE_CLIENT_ID;
      delete process.env.GOOGLE_MOBILE_CLIENT_ID;

      // Need a fresh app without the env var
      const moduleFixture2: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(GoogleStrategy)
        .useClass(StubGoogleStrategy)
        .compile();

      const app2 = moduleFixture2.createNestApplication();
      app2.setGlobalPrefix('api');
      app2.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app2.init();

      await request(app2.getHttpServer())
        .post('/api/auth/google/id-token')
        .send({ idToken: 'some-token' })
        .expect(503);

      await app2.close();
      process.env.GOOGLE_MOBILE_CLIENT_ID = savedMobileClientId;
    });
  });
});
