import { User } from '@database/mysql/entities';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@shared/database.module';
import { AuthController } from './auth.controller';
import { UserService } from '@modules/user/user.service';

@Module({
  imports: [DatabaseModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService],
})
export class AuthModule {}
