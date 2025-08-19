import { Transform } from "class-transformer";
import { IsString, IsStrongPassword, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsString()
    token: string;

    @Transform(({value}) => value.trim())
    @IsString()
    @MinLength(6)
    @IsStrongPassword()
    password: string;
}