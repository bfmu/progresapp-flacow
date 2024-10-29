import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { MusclesModule } from 'src/muscles/muscles.module';
import { MusclesService } from 'src/muscles/muscles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise]), MusclesModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService,TypeOrmModule]
})
export class ExercisesModule {}
 