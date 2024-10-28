import { Module } from '@nestjs/common';
import { ExercisesModule } from './exercises/exercises.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusclesModule } from './muscles/muscles.module';

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
    ExercisesModule,
    MusclesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
