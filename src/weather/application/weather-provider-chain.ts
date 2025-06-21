import { WeatherProvider } from '../domain/interfaces/weather-provider.interface';
import { WeatherData } from '../domain/types/weather-data.type';

export class WeatherProviderChain {
  private index = 0;

  constructor(private readonly providers: WeatherProvider[]) {}

  async getWeather(city: string): Promise<WeatherData> {
    if (this.index >= this.providers.length) {
      throw new Error('All weather providers failed');
    }

    const provider = this.providers[this.index];
    this.index++;

    try {
      return await provider.getWeather(city);
    } catch (error) {
      console.warn(`[Provider error]: ${error}`);
      return this.getWeather(city);
    }
  }
}
