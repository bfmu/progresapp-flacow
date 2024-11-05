import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise } from './entities/exercise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Muscle } from 'src/muscles/entities/muscle.entity';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(Muscle)
    private readonly muscleRepository: Repository<Muscle>,
  ) {}

  async create(createExerciseDto: CreateExerciseDto) {
    const muscle = await this.muscleRepository.findOneBy({
      id: createExerciseDto.muscleId,
    });

    if (!muscle) {
      throw new BadRequestException('Muscle not found');
    }

    const exercise = this.exerciseRepository.create({
      ...createExerciseDto,
      muscle,
    });

    return await this.exerciseRepository.save(exercise);
  }

  async findAll() {
    return await this.exerciseRepository.find();
  }

  async findOne(id: number) {
    return await this.exerciseRepository.findOneBy({ id: id });
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto) {
    if (updateExerciseDto.muscleId) {
      const muscle = await this.muscleRepository.findOneBy({
        id: updateExerciseDto.muscleId,
      });

      if (!muscle) {
        throw new BadRequestException('Muscle not found');
      }

      updateExerciseDto = this.exerciseRepository.create({
        ...UpdateExerciseDto,
        muscle,
      });
    }

    return await this.exerciseRepository.update(id, updateExerciseDto);
  }

  async remove(id: number) {
    return await this.exerciseRepository.softDelete(id);
  }
}
