/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { Weather } from '../domain/weather.model';
import { WeatherClient } from './weather-client';
import { RedisService } from '../../common/redis/redis.service';
import { MetricsService } from 'src/monitoring/metrics.service';
@Injectable()
export class WeatherService {
  constructor(
    private readonly client: WeatherClient,
    private readonly redisService: RedisService,
    private readonly metricsService: MetricsService,
  ) {}

  async getCurrentWeather(city: string): Promise<Weather> {
    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.metricsService.incWeatherCacheHit();
      const data = JSON.parse(cached);
      return new Weather(data.temperature, data.humidity, data.description);
    }

    this.metricsService.incWeatherCacheMiss();
    const data = await this.client.getWeather(city);
    const weather = new Weather(
      data.temperature,
      data.humidity,
      data.description,
    );

    await this.redisService.set(cacheKey, JSON.stringify(weather), 3600);

    return weather;
  }
}
