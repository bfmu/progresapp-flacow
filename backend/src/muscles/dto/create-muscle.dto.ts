import { IsString } from "class-validator";

export class CreateMuscleDto {
    @IsString()
    name: string;
}
