import { IsString } from 'class-validator';

export class GoogleIdTokenDto {
  @IsString()
  idToken: string;
}
