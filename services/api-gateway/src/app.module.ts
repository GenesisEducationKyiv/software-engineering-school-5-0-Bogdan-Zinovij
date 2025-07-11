/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WeatherGatewayController } from './weather/weather-gateway.controller';

@Module({
  imports: [
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
    ]),
  ],
  controllers: [WeatherGatewayController],
})
export class AppModule {}
