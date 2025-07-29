import { Injectable } from '@nestjs/common';
import { Weather } from '../domain/weather.model';
import { WeatherClient } from './weather-client';
import { CacheService } from '../../cache/domain/cache.service';
import { LoggerPort } from '@libs/logger';
import { MetricsService } from '@libs/metrics';
import { SampleLogger } from '@libs/logger';

@Injectable()
export class WeatherService {
  private readonly cacheLoggerSampler = new SampleLogger(100);
  private readonly context = 'WeatherService';

  constructor(
    private readonly client: WeatherClient,
    private readonly cache: CacheService,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

  async getCurrentWeather(city: string): Promise<Weather> {
    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = await this.cache.get<Weather>(cacheKey);
    const shouldLog = this.cacheLoggerSampler.shouldLog();

    if (cached) {
      if (shouldLog) {
        this.logger.debug(`Cache HIT for ${city}`, this.context);
      }
      this.metrics.incWeatherCacheHit();

      return cached;
    }

    if (shouldLog) {
      this.logger.debug(
        `Cache MISS for ${city}, fetching from providers`,
        this.context,
      );
    }
    this.metrics.incWeatherCacheMiss();

    const weather = await this.client.getWeather(city);
    await this.cache.set<Weather>(cacheKey, weather, 3600);

    this.logger.info(`Weather for ${city} fetched and cached`, this.context);

    return weather;
  }
}
