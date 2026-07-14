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
  const preferredPort = Number(process.env.PORT ?? 3001);
  const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);

  for (let offset = 0; offset <= 10; offset++) {
    const port = preferredPort + offset;
    try {
      await app.listen(port);
      console.log(`API de Nuestra Biblioteca lista en http://localhost:${port}`);
      return;
    } catch (error: any) {
      if (error?.code !== 'EADDRINUSE' || isRailway) {
        throw error;
      }
      console.warn(`El puerto ${port} esta ocupado. Probando ${port + 1}...`);
    }
  }

  throw new Error(`No hay puertos disponibles desde ${preferredPort} hasta ${preferredPort + 10}`);
}

void bootstrap();
