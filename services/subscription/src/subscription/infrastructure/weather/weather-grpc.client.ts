import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WeatherData } from '../../../common/types/weather-data.type';
import { lastValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';

interface WeatherServiceGrpc {
  getCurrentWeather(request: { city: string }): any;
}

@Injectable()
export class WeatherGrpcClientService implements OnModuleInit {
  private weatherService: WeatherServiceGrpc;

  constructor(@Inject('WEATHER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.weatherService =
      this.client.getService<WeatherServiceGrpc>('WeatherService');
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response$ = this.weatherService.getCurrentWeather({ city });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await lastValueFrom(response$);
  }
}
