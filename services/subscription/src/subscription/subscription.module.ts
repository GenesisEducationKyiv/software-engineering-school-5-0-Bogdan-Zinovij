import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionEntity } from './infrastructure/persistence/entities/subscription.entity';
import { TypeOrmSubscriptionRepository } from './infrastructure/persistence/repositories/typeorm-subscription.repository';
import { SubscriptionCronService } from './application/cron/subscription.cron';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenModule } from 'src/token/token.module';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WeatherGrpcClientService } from './infrastructure/weather/weather-grpc.client';
import { NotificationGrpcClientService } from './infrastructure/notification/notification-grpc.client';
import { SubscriptionGrpcController } from './presentation/controllers/subscription-grpc.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'subscription',
            brokers: ['kafka:9092'],
            retry: {
              retries: 5,
              factor: 2,
              initialRetryTime: 3000,
            },
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
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
  controllers: [SubscriptionGrpcController],
  providers: [
    SubscriptionService,
    SubscriptionCronService,
    NotificationGrpcClientService,
    WeatherGrpcClientService,
    {
      provide: 'SubscriptionRepository',
      useClass: TypeOrmSubscriptionRepository,
    },
    {
      provide: 'NOTIFICATION_URL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.get<string>('NOTIFICATION_URL'),
    },
    {
      provide: 'WEATHER_URL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get<string>('WEATHER_URL'),
    },
  ],
})
export class SubscriptionModule {}
