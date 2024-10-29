import { IsString, IsNotEmpty } from "class-validator";

export class CreateMuscleDto {
  @IsString({ message: 'El nombre del músculo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del músculo no puede estar vacío.' })
  name: string;
}
