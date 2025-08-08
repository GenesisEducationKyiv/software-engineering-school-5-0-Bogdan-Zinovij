import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WeatherGatewayController } from './weather/weather-gateway.controller';
import { SubscriptionGatewayController } from './subscription/subscription-gateway.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerModule } from '@libs/logger';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GatewayMetricsModule } from './metrics/gateway-metrics.module';
import { HttpMetricsInterceptor } from './metrics/infrastructure/http-metrics.interceptor';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    LoggerModule,
    GatewayMetricsModule,
    ClientsModule.register([
      {
        name: 'WEATHER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'weather',
          protoPath: join(__dirname, './libs/grpc/proto/weather.proto'),
          url: 'weather:50052',
        },
      },
      {
        name: 'SUBSCRIPTION_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'subscription',
          protoPath: join(__dirname, './libs/grpc/proto/subscription.proto'),
          url: 'subscription:50053',
        },
      },
    ]),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
  controllers: [WeatherGatewayController, SubscriptionGatewayController],
})
export class AppModule {}
