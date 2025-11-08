import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { GlobalFilter } from './common/filters/global.filter';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalFilter());

  const configService = app.get(ConfigService); 
  const port = configService.get<number>('PORT') || 3001
  await app.listen(port);
  console.log(`Order microservice is running on port ${port}`);
}
bootstrap();
