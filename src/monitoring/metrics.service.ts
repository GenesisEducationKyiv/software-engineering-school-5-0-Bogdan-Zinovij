import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('weather_cache_hit')
    private readonly weatherCacheHit: Counter,

    @InjectMetric('weather_cache_miss')
    private readonly weatherCacheMiss: Counter,
  ) {}

  incWeatherCacheHit(): void {
    this.weatherCacheHit.inc();
  }

  incWeatherCacheMiss(): void {
    this.weatherCacheMiss.inc();
  }
}
