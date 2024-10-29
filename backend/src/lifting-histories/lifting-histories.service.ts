import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateLiftingHistoryDto,
  RequestCreateLiftingHistoryDto,
} from './dto/create-lifting-history.dto';
import { UpdateLiftingHistoryDto } from './dto/update-lifting-history.dto';
import { ActiveUserI } from 'src/common/active-user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiftingHistory } from './entities/lifting-history.entity';
import { ExercisesService } from 'src/exercises/exercises.service';
import { Exercise } from 'src/exercises/entities/exercise.entity';

@Injectable()
export class LiftingHistoriesService {
  constructor(
    @InjectRepository(LiftingHistory)
    private readonly liftingHistoriesRepository: Repository<LiftingHistory>,
    @InjectRepository(Exercise)
    private readonly exercisesRepository: Repository<Exercise>,
  ) {}

  async create(
    requestCreateLiftingHistoryDto: RequestCreateLiftingHistoryDto,
    user: ActiveUserI,
  ) {
    // Consultar la instancia de exercise
    const exercise = await this.exercisesRepository.findOneBy({
      id: requestCreateLiftingHistoryDto.exerciseId,
    });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Crear un nuevo LiftingHistory directamente
    const newLiftingHistory = this.liftingHistoriesRepository.create({
      user: { id: user.sub }, // Pasamos solo el ID de User como referencia
      exercise: exercise, // Pasamos el objeto completo de Exercise
      weight: requestCreateLiftingHistoryDto.weight,
      repeatNumber: requestCreateLiftingHistoryDto.repeatNumber,
      date: new Date(),
    });

    return await this.liftingHistoriesRepository.save(newLiftingHistory);
  }

  // Obtener todos los registros de levantamiento
  async findAll(user: ActiveUserI) {
    if (user.roles.includes('admin')) {
      return this.liftingHistoriesRepository.find();
    } else {
      return this.liftingHistoriesRepository.find({
        where: { user: { id: user.sub } },
      });
    }
  }

  // Obtener un registro de levantamiento por ID
  async findOne(id: number, user: ActiveUserI) {
    const liftingHistory = await this.liftingHistoriesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!liftingHistory) {
      throw new NotFoundException(`LiftingHistory with ID ${id} not found`);
    }

    if (!user.roles.includes('admin') && liftingHistory.user.id !== user.sub) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return liftingHistory;
  }

  // Actualizar un registro de levantamiento
  async update(
    id: number,
    updateLiftingHistoryDto: UpdateLiftingHistoryDto,
    user: ActiveUserI,
  ) {
    const liftingHistory = await this.findOne(id, user); // Verifica si el usuario puede acceder

    if (!user.roles.includes('admin') && liftingHistory.user.id !== user.sub) {
      throw new ForbiddenException(
        'You do not have permission to update this record',
      );
    }

    Object.assign(liftingHistory, updateLiftingHistoryDto);

    return await this.liftingHistoriesRepository.save(liftingHistory);
  }

  // Eliminar un registro de levantamiento (solo admin)
  async remove(id: number, user: ActiveUserI) {
    if (!user.roles.includes('admin')) {
      throw new ForbiddenException(
        'You do not have permission to delete this record',
      );
    }

    const liftingHistory = await this.liftingHistoriesRepository.findOneBy({
      id,
    });
    if (!liftingHistory) {
      throw new NotFoundException(`LiftingHistory with ID ${id} not found`);
    }

    return await this.liftingHistoriesRepository.softDelete(id);
  }
}
