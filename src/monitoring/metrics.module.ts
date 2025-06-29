import { Module } from '@nestjs/common';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';

@Module({
  providers: [
    MetricsService,

    makeCounterProvider({
      name: 'weather_cache_hit',
      help: 'Number of times weather data was returned from cache',
    }),
    makeCounterProvider({
      name: 'weather_cache_miss',
      help: 'Number of times weather data was not in cache and fetched from API',
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
