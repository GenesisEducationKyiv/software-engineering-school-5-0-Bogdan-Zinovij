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
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WeatherGrpcClientService } from './infrastructure/weather/weather-grpc.client';
import { NotificationGrpcClientService } from './infrastructure/notification/notification-grpc.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WEATHER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'weather',
          protoPath: join(__dirname, '../../proto/weather.proto'),
          url: 'weather:50052',
        },
      },
      {
        name: 'NOTIFICATION_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'notification',
          protoPath: join(__dirname, '../../proto/notification.proto'),
          url: 'notification:50051',
        },
      },
    ]),
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
    NotificationGrpcClientService,
    WeatherHttpClientService,
    WeatherGrpcClientService,
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
