import * as md5 from 'md5';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@database/mysql/entities';
import { SignupDto } from './dtos/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService,

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
  
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { Email: email } });
  }


  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email does not exist!');
    }
  
    if (!user.Password) {
      throw new UnauthorizedException('User password is missing in DB!');
    }
    const hashedInputPassword = md5(password);

    if (hashedInputPassword !== user.Password) {
      throw new UnauthorizedException('Password is incorrect!');
    }
  
    const { Password, ...result } = user;
    return result;
  }

  async signin(user: {
    Id: number;
    Username: string;
    Email: string;
}) {
    const payload = { email: user.Email, sub: user.Id };
    return {
      token: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET }),
      user,
    };
  }
}
