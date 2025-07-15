import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WeatherGatewayController } from './weather/weather-gateway.controller';
import { SubscriptionGatewayController } from './subscription/subscription-gateway.controller';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ClientsModule.register([
      {
        name: 'WEATHER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'weather',
          protoPath: join(__dirname, '../proto/weather.proto'),
          url: 'weather:50052',
        },
      },
      {
        name: 'SUBSCRIPTION_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'subscription',
          protoPath: join(__dirname, '../proto/subscription.proto'),
          url: 'subscription:50053',
        },
      },
    ]),
  ],
  controllers: [WeatherGatewayController, SubscriptionGatewayController],
})
export class AppModule {}
