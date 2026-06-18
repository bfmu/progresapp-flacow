import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const DEFAULT_CORS_ORIGINS = [
  'http://localhost:4321',
  'http://localhost:81',
];

/**
 * Builds the CORS options for the application based on the `CORS_ORIGINS`
 * environment variable, a comma-separated list of allowed origins.
 *
 * When `CORS_ORIGINS` is not set, falls back to `DEFAULT_CORS_ORIGINS`
 * (local development defaults) so existing dev setups keep working.
 *
 * Using an explicit allow-list (instead of `origin: '*'`) is required
 * because the app also sets `credentials: true`, and per the CORS spec
 * browsers reject a wildcard origin combined with credentials.
 */
export function getCorsOptions(
  env: Record<string, string | undefined> = process.env,
): CorsOptions {
  const configuredOrigins = env.CORS_ORIGINS;

  const allowedOrigins = configuredOrigins
    ? configuredOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    : DEFAULT_CORS_ORIGINS;

  return {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
}
