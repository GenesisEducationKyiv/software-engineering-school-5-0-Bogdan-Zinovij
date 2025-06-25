import { Injectable } from '@nestjs/common';
import { Weather } from '../domain/weather.model';
import { WeatherClient } from './weather-client';

@Injectable()
export class WeatherService {
  constructor(private readonly client: WeatherClient) {}

  async getCurrentWeather(city: string): Promise<Weather> {
    const data = await this.client.getWeather(city);
    return new Weather(data.temperature, data.humidity, data.description);
  }
}
