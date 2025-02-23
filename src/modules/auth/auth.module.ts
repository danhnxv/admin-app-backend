import { User } from '@database/mysql/entities';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@shared/database.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [DatabaseModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}
