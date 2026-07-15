import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const allowedOrigin = process.env.FRONTEND_URL;
  app.enableCors({
    origin: allowedOrigin ? [allowedOrigin, 'http://localhost:5173'] : true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`API de Nuestra Biblioteca lista en http://localhost:${port}`);
}

void bootstrap();
