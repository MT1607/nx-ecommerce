/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.USER_SERVICE_HOST || '',
      port: process.env.USER_SERVICE_PORT
    }
  })

  app.listen();
  Logger.log(`🚀 User service is running!`, 'UserService');
}

bootstrap();
