import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentVariables } from '../commons/configs';
import { validateObject } from './validators/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => validateObject(config, EnvironmentVariables),
      cache: true,
    }),
  ],
})
export class SharedModule {}
