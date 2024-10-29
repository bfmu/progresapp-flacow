import { IsString, IsNotEmpty } from "class-validator";

export class CreateRoleDto {
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del rol no puede estar vacío.' })
  name: string;
}
