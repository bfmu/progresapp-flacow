import { Module } from '@nestjs/common';
import { MusclesService } from './muscles.service';
import { MusclesController } from './muscles.controller';
import { Muscle } from './entities/muscle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Muscle])],
  controllers: [MusclesController],
  providers: [MusclesService],
  exports: [TypeOrmModule]
})
export class MusclesModule {}
