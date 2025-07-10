import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionController } from './interfaces/controllers/subscription.controller';
import { SubscriptionEntity } from './infrastructure/persistence/entities/subscription.entity';
import { TypeOrmSubscriptionRepository } from './infrastructure/persistence/repositories/typeorm-subscription.repository';
import { WeatherModule } from 'src/weather/weather.module';
import { SubscriptionCronService } from './application/cron/subscription.cron';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenModule } from 'src/token/token.module';
import { NotificationHttpService } from './application/notification/notification-http-service';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity]),
    ScheduleModule.forRoot(),
    ConfigModule,
    WeatherModule,
    TokenModule,
    HttpModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionCronService,
    NotificationHttpService,
    {
      provide: 'SubscriptionRepository',
      useClass: TypeOrmSubscriptionRepository,
    },
  ],
})
export class SubscriptionModule {}
