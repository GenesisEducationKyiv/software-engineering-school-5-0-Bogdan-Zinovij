import { Injectable } from '@nestjs/common';
import { WeatherProvider } from '../domain/interfaces/weather-provider.interface';
import { WeatherData } from '../domain/types/weather-data.type';

@Injectable()
export class WeatherClient {
  constructor(private readonly providers: WeatherProvider[]) {}

  async getWeather(city: string): Promise<WeatherData> {
    console.log(this.providers);
    for (const provider of this.providers) {
      try {
        return provider.getWeather(city);
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    throw new Error('All weather providers failed');
  }
}
