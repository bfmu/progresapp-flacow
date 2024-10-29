import { IsNumber, IsOptional, IsString, IsNotEmpty } from "class-validator";

export class CreateExerciseDto {

  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  name: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'El ID del músculo debe ser un número.' })
  @IsNotEmpty({ message: 'El ID del músculo no puede estar vacío.' })
  muscleId: number;
}
