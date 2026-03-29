import { Injectable } from '@nestjs/common';
import { Weather } from '../domain/weather.model';
import { WeatherClient } from './weather-client';
import { CacheService } from '../../cache/domain/cache.service';
import { LoggerPort } from '@libs/logger';
import { WeatherMetricsService } from 'src/metrics/domain/weather-metrics.service';

@Injectable()
export class WeatherService {
  private readonly context = 'WeatherService';
  private readonly logSampleRate = 100;

  constructor(
    private readonly client: WeatherClient,
    private readonly cache: CacheService,
    private readonly logger: LoggerPort,
    private readonly metrics: WeatherMetricsService,
  ) {}

  async getCurrentWeather(city: string): Promise<Weather> {
    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = await this.cache.get<Weather>(cacheKey);

    if (cached) {
      this.logger.debug(
        `Cache HIT for ${city}`,
        this.context,
        this.logSampleRate,
      );
      this.metrics.incWeatherCacheHit();

      return cached;
    }

    this.logger.debug(
      `Cache MISS for ${city}, fetching from providers`,
      this.context,
      this.logSampleRate,
    );
    this.metrics.incWeatherCacheMiss();

    const weather = await this.client.getWeather(city);
    await this.cache.set<Weather>(cacheKey, weather, 3600);

    this.logger.info(`Weather for ${city} fetched and cached`, this.context);

    return weather;
  }
}
