import { Module } from '@nestjs/common';
import { ExercisesModule } from './exercises/exercises.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusclesModule } from './muscles/muscles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { InitModule } from './init/init.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'flacow',
      password: 'flacow123',
      database: 'progresapp-flacow',
      autoLoadEntities: true,
      synchronize: true,
    }),
    InitModule,
    ExercisesModule,
    MusclesModule,
    UsersModule,
    AuthModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
