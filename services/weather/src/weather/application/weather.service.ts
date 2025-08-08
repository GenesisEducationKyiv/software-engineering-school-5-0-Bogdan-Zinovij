import { Injectable } from '@nestjs/common';
import { Weather } from '../domain/weather.model';
import { WeatherClient } from './weather-client';
import { MetricsService } from '../../monitoring/domain/metrics.service';
import { CacheService } from '../../cache/domain/cache.service';

@Injectable()
export class WeatherService {
  constructor(
    private readonly client: WeatherClient,
    private readonly cache: CacheService,
    private readonly metricsService: MetricsService,
  ) {}

  async getCurrentWeather(city: string): Promise<Weather> {
    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = await this.cache.get<Weather>(cacheKey);

    if (cached) {
      this.metricsService.incWeatherCacheHit();
      return cached;
    }

    this.metricsService.incWeatherCacheMiss();
    const weather = await this.client.getWeather(city);
    await this.cache.set<Weather>(cacheKey, weather, 3600);

    return weather;
  }
}
