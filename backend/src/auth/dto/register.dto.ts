import { Transform } from "class-transformer";
import { IsEmail, IsString, IsStrongPassword, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    @MinLength(2)
    full_name: string;

    @IsEmail()
    email: string;

    @Transform(({value}) => value.trim())
    @IsString()
    @MinLength(6)
    @IsStrongPassword()
    password: string;
}