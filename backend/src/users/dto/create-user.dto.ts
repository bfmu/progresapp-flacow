import { IsDefined, IsEmail, IsString } from "class-validator";

export class CreateUserDto {
    full_name: string;
    email: string;
    password: string;
}
