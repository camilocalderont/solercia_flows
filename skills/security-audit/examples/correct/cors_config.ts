// ✅ CORRECTO: CORS restringido a dominios conocidos

import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS con whitelist de dominios
  app.enableCors({
    origin: [
      'https://www.solercia.com.co',
      'https://boki-api.solercia.com.co',
      'https://flows.solercia.com.co',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-token'],
    credentials: true,
    maxAge: 3600,
  });

  await app.listen(3000);
}
