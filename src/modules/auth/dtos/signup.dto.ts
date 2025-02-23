import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  Username: string;

  @IsNotEmpty()
  @MinLength(6)
  Password: string;

  @IsEmail()
  Email: string;
}
