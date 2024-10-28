import { Injectable } from '@nestjs/common';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Muscle } from './entities/muscle.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MusclesService {

  constructor(
    @InjectRepository(Muscle)
    private readonly muscleRepository: Repository<Muscle>,
  ) {}


  async create(createMuscleDto: CreateMuscleDto) {
    const muscle = this.muscleRepository.create(createMuscleDto);
    return await this.muscleRepository.save(muscle);
  }

  async findAll() {
    return await this.muscleRepository.find();
  }

  async findOne(id: number) {
    return await this.muscleRepository.findOneBy({ id: id });
  }

  async update(id: number, updateMuscleDto: UpdateMuscleDto) {
    return await this.muscleRepository.update(id, updateMuscleDto);
  }

  async remove(id: number) {
    return await this.muscleRepository.softDelete(id);
  }
}
