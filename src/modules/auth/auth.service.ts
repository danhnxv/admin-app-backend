import * as md5 from 'md5';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@database/mysql/entities';
import { SignupDto } from './dtos/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ message: string }> {
    const { Username, Password, Email } = signupDto;

    const user = await this.userRepository.findOne({
      where: [{ Username }, { Email }],
    });

    if (user) {
      if (user.Username === Username) {
        throw new BadRequestException('Username already exists');
      }
      if (user.Email === Email) {
        throw new BadRequestException('Email already exists');
      }
    }

    const hashedPassword = md5(Password);

    const newUser = this.userRepository.create({
      Username,
      Password: hashedPassword,
      Email,
    });

    await this.userRepository.save(newUser);

    return { message: 'User registered successfully' };
  }
}
