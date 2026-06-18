import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { getCorsOptions } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar un prefijo para todas las rutas
  app.setGlobalPrefix('api');

  // Hacer validaciones de datos de entrada
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors(getCorsOptions(process.env));

  await app.listen(process.env.PORT ?? 3000);
  Logger.debug(
    `Application is running on: ${await app.getUrl()}`,
    'Bootstrap',
  );
}
bootstrap();
