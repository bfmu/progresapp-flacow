import { IsNumber, IsInt, IsPositive, IsNotEmpty, IsDate } from 'class-validator';
import { Exercise } from 'src/exercises/entities/exercise.entity';

export class RequestCreateLiftingHistoryDto {
  @IsNumber({ maxDecimalPlaces: 1 }, { message: 'El peso debe ser un número con un máximo de un decimal.' })
  @IsPositive({ message: 'El peso debe ser un número positivo.' })
  weight: number;

  @IsInt({ message: 'El número de repeticiones debe ser un entero.' })
  @IsPositive({ message: 'El número de repeticiones debe ser un número positivo.' })
  repeatNumber: number;

  @IsInt({ message: 'El ID del ejercicio debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID del ejercicio no puede estar vacío.' })
  @IsPositive({ message: 'El ID del ejercicio debe ser un número positivo.' })
  exerciseId: number;
}

export class CreateLiftingHistoryDto {
    @IsNumber({ maxDecimalPlaces: 1 }, { message: 'El peso debe ser un número con un máximo de un decimal.' })
    @IsPositive({ message: 'El peso debe ser un número positivo.' })
    weight: number;

    @IsDate()
    date: Date;
  
    @IsInt({ message: 'El número de repeticiones debe ser un entero.' })
    @IsPositive({ message: 'El número de repeticiones debe ser un número positivo.' })
    repeatNumber: number;
  
    
    exerciseId: Exercise;

    @IsInt({ message: 'El ID del usuario debe ser un número entero.' })
    @IsNotEmpty({ message: 'El ID del usuario no puede estar vacío.' })
    @IsPositive({ message: 'El ID del usuario debe ser un número positivo.' })
    userId: number;
  }
