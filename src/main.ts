import { setupSwagger } from '@modules/swagger';
import { NestFactory } from '@nestjs/core';
import { NodeEnv } from '@shared/enums/node-env';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { AppModule } from './app.module';
import commonBootstrap from './commons/bootstrap';
import { appEnvs } from './commons/configs';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin:
        appEnvs.NODE_ENV === NodeEnv.development ? '*' : appEnvs.CORS_ORIGIN,
    },
  });
  setupSwagger(app);

  commonBootstrap(app, AppModule);

  app.use((req, res, next) => {
    Logger.log(`${req.method} ${req.url}`, 'RequestLogger');
    next();
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(appEnvs.APP_PORT || 4000);
}
bootstrap();
