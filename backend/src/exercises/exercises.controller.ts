import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Auth(['admin'])
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Auth(['user'])
  @Get()
  findAll() {
    return this.exercisesService.findAll();
  }

  @Auth(['user'])
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateExerciseDto: UpdateExerciseDto) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.exercisesService.remove(id);
  }
}
