import 'reflect-metadata';

import { NodeEnv } from '@shared/enums/node-env';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  APP_PORT: number;

  @IsString()
  @ValidateIf((o: EnvironmentVariables) => !o.isCurrentNodeEnv([NodeEnv.test]))
  DB_HOST: string;

  @IsNumber()
  @ValidateIf((o: EnvironmentVariables) => !o.isCurrentNodeEnv([NodeEnv.test]))
  DB_PORT: number;

  @IsString()
  @ValidateIf((o: EnvironmentVariables) => !o.isCurrentNodeEnv([NodeEnv.test]))
  DB_NAME: string;

  @IsString()
  @ValidateIf((o: EnvironmentVariables) => !o.isCurrentNodeEnv([NodeEnv.test]))
  DB_USERNAME: string;

  @IsString()
  @ValidateIf((o: EnvironmentVariables) => !o.isCurrentNodeEnv([NodeEnv.test]))
  DB_PASSWORD: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION: string;

  @IsArray()
  @IsString({ each: true })
  @ValidateIf((o: EnvironmentVariables) =>
    o.isCurrentNodeEnv([NodeEnv.production, NodeEnv.staging]),
  )
  @Transform(({ value }) => value.split(','))
  CORS_ORIGIN: Array<string>;

  @IsEnum(NodeEnv)
  @Transform(({ value }) => value?.toLowerCase())
  NODE_ENV: NodeEnv;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  DEFAULT_PAGINATION_PAGE_SIZE: number;

  isCurrentNodeEnv(envs: Array<NodeEnv>): boolean {
    return envs.includes(this.NODE_ENV);
  }
}
