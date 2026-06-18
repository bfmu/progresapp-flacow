import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesModule } from './exercises/exercises.module';
import { MusclesModule } from './muscles/muscles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { InitModule } from './init/init.module';
import { LiftingHistoriesModule } from './lifting-histories/lifting-histories.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().optional().allow(''),
        GOOGLE_CLIENT_SECRET: Joi.string().optional().allow(''),
        GOOGLE_CALLBACK_URL: Joi.string().optional().allow(''),
        GOOGLE_MOBILE_CLIENT_ID: Joi.string().optional().allow(''),
        FRONTEND_BASE_URL: Joi.string().optional().allow(''),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: configService.get('BACKEND_SYNCHRONIZE', true),
      }),
    }),
    InitModule,
    ExercisesModule,
    MusclesModule,
    UsersModule,
    AuthModule,
    RolesModule,
    LiftingHistoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
