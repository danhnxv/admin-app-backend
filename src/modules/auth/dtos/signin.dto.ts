import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SigninDto {
  @IsNotEmpty()
  @MinLength(6)
  Password: string;

  @IsNotEmpty()
  @IsEmail()
  Email: string;
}
