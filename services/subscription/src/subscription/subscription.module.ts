import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionController } from './presentation/controllers/subscription.controller';
import { SubscriptionEntity } from './infrastructure/persistence/entities/subscription.entity';
import { TypeOrmSubscriptionRepository } from './infrastructure/persistence/repositories/typeorm-subscription.repository';
import { SubscriptionCronService } from './application/cron/subscription.cron';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenModule } from 'src/token/token.module';
import { NotificationHttpService } from './infrastructure/notification/notification-http-service';
import { HttpModule } from '@nestjs/axios';
import { WeatherHttpClientService } from './infrastructure/weather/weather-http.client';
@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity]),
    ScheduleModule.forRoot(),
    ConfigModule,
    TokenModule,
    HttpModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionCronService,
    NotificationHttpService,
    WeatherHttpClientService,
    {
      provide: 'SubscriptionRepository',
      useClass: TypeOrmSubscriptionRepository,
    },
    {
      provide: 'NOTIFICATION_URL',
      useValue: process.env.NOTIFICATION_URL ?? 'http://notification:3001',
    },
    {
      provide: 'WEATHER_URL',
      useValue: process.env.WEATHER_URL ?? 'http://weather:3002',
    },
  ],
})
export class SubscriptionModule {}
