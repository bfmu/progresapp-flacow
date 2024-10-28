import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateExerciseDto {

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    muscleId: number;
}
