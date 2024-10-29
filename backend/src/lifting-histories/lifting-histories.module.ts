import { Module } from '@nestjs/common';
import { LiftingHistoriesService } from './lifting-histories.service';
import { LiftingHistoriesController } from './lifting-histories.controller';
import { LiftingHistory } from './entities/lifting-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesModule } from 'src/exercises/exercises.module';
import { ExercisesService } from 'src/exercises/exercises.service';

@Module({
  imports: [TypeOrmModule.forFeature([LiftingHistory]), ExercisesModule],
  controllers: [LiftingHistoriesController],
  providers: [LiftingHistoriesService],
})
export class LiftingHistoriesModule {}
