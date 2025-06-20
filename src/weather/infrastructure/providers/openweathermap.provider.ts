import { Injectable } from '@nestjs/common';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherData } from 'src/weather/domain/types/weather-data.type';

@Injectable()
export class OpenWeatherMapProvider implements WeatherProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  async getWeather(city: string): Promise<WeatherData> {
    return {
      temperature: 20,
      humidity: 50,
      description: 'Sunny (from OpenWeatherMap stub)',
    };
  }
}
