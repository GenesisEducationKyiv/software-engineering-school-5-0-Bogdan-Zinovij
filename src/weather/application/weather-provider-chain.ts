import { WeatherProvider } from '../domain/interfaces/weather-provider.interface';
import { WeatherData } from '../domain/types/weather-data.type';

export class WeatherProviderChain {
  constructor(private readonly providers: WeatherProvider[]) {}

  async getWeather(city: string): Promise<WeatherData> {
    for (const provider of this.providers) {
      try {
        return await provider.getWeather(city);
      } catch {
        continue;
      }
    }

    throw new Error('All weather providers failed');
  }
}
