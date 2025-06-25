import { WeatherProvider } from '../domain/interfaces/weather-provider.interface';
import { WeatherData } from '../domain/types/weather-data.type';

export class WeatherProviderChain {
  constructor(private readonly providers: WeatherProvider[]) {}

  async getWeather(city: string): Promise<WeatherData> {
    let lastError: unknown = null;

    for (const provider of this.providers) {
      try {
        return await provider.getWeather(city);
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    } else {
      throw new Error('All weather providers failed');
    }
  }
}
