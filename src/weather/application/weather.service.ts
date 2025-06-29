import { Inject, Injectable } from '@nestjs/common';
import { Weather } from '../domain/weather.model';
import { WeatherClient } from './weather-client';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class WeatherService {
  constructor(
    private readonly client: WeatherClient,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getCurrentWeather(city: string): Promise<Weather> {
    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = await this.cacheManager.get<Weather>(cacheKey);

    if (cached) {
      return cached;
    }

    const weather = await this.client.getWeather(city);
    await this.cacheManager.set(cacheKey, weather);

    return weather;
  }
}
