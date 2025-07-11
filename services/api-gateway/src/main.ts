import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupProxy } from './proxy.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupProxy(app.getHttpAdapter().getInstance());
  await app.listen(process.env.APP_PORT ?? 3000);
}
void bootstrap();
