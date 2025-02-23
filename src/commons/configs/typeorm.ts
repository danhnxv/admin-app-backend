import * as DBEntities from '@database/mysql/entities';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { NodeEnv } from '@shared/enums/node-env';
import '@shared/libs/typeorm';
import { appEnvs } from '.';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor() {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return createTypeOrmOptions();
  }
}

export const createTypeOrmOptions = (): TypeOrmModuleOptions => {
  if (appEnvs.NODE_ENV === NodeEnv.development) {
    return {
      type: 'mariadb',
      host: appEnvs.DB_HOST,
      port: appEnvs.DB_PORT,
      username: appEnvs.DB_USERNAME,
      password: appEnvs.DB_PASSWORD,
      database: appEnvs.DB_NAME,
      entities: [...Object.values(DBEntities)],
      timezone: 'Z',
    };
  }
};
