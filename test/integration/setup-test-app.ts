import { INestApplication, ValidationPipe } from '@nestjs/common';

export async function setupTestApp(app: INestApplication): Promise<void> {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
}

export async function teardownTestApp(app: INestApplication): Promise<void> {
  await app.close();
}
