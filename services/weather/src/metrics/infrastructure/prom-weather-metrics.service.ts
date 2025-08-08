// services/weather/metrics/prom-weather-metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { WeatherMetricsService } from '../domain/weather-metrics.service';

@Injectable()
export class PromWeatherMetricsService implements WeatherMetricsService {
  constructor(
    @InjectMetric('weather_cache_hit_total')
    private readonly weatherCacheHit: Counter,
    @InjectMetric('weather_cache_miss_total')
    private readonly weatherCacheMiss: Counter,
  ) {}

  incWeatherCacheHit(): void {
    this.weatherCacheHit.inc();
  }

  incWeatherCacheMiss(): void {
    this.weatherCacheMiss.inc();
  }
}
