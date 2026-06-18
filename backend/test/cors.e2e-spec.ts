import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getCorsOptions } from './../src/config/cors.config';

const ALLOWED_ORIGIN = 'http://allowed.example.com';
const DISALLOWED_ORIGIN = 'http://not-allowed.example.com';

describe('CORS (e2e)', () => {
  let app: INestApplication;
  let previousCorsOrigins: string | undefined;

  beforeAll(async () => {
    previousCorsOrigins = process.env.CORS_ORIGINS;
    process.env.CORS_ORIGINS = ALLOWED_ORIGIN;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirrors the CORS setup applied in src/main.ts at bootstrap time.
    app.enableCors(getCorsOptions(process.env));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env.CORS_ORIGINS = previousCorsOrigins;
  });

  it('responds with a matching Access-Control-Allow-Origin for an allowed origin', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('Origin', ALLOWED_ORIGIN);

    expect(response.headers['access-control-allow-origin']).toBe(
      ALLOWED_ORIGIN,
    );
  });

  it('does not reflect a disallowed origin in Access-Control-Allow-Origin', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('Origin', DISALLOWED_ORIGIN);

    expect(response.headers['access-control-allow-origin']).not.toBe(
      DISALLOWED_ORIGIN,
    );
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
