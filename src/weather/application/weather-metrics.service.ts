import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class WeatherMetricsService {
  constructor(
    @InjectMetric('weather_cache_hit')
    private readonly cacheHitCounter: Counter,

    @InjectMetric('weather_cache_miss')
    private readonly cacheMissCounter: Counter,
  ) {}

  incrementCacheHit(): void {
    this.cacheHitCounter.inc();
  }

  incrementCacheMiss(): void {
    this.cacheMissCounter.inc();
  }
}
