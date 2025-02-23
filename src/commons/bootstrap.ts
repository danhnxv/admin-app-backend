import { INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

/**
 * Core bootstrap module should be loaded here.
 * @param app
 *
 */

export default async function commonBootstrap(
  app: INestApplication,
  module: any,
) {
  useContainer(app.select(module), { fallbackOnErrors: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
}
