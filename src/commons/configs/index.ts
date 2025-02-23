import { validateObject } from '@shared/validators/config';
import 'dotenv/config';
import { EnvironmentVariables } from './environment';

export const appEnvs = validateObject<EnvironmentVariables>(
  process.env,
  EnvironmentVariables,
);

export * from './environment';
export * from './typeorm';
