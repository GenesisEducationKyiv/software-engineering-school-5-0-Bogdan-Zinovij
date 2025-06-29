import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { DatabaseModule } from './database/database.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TokenModule } from './token/token.module';
import { validationSchema } from './config/validation';
import { RedisCacheModule } from './cache/cache.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    RedisCacheModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    PrometheusModule.register(),
    DatabaseModule,
    WeatherModule,
    SubscriptionModule,
    TokenModule,
  ],
})
export class AppModule {}
