import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { WeatherMetricsService } from './domain/weather-metrics.service';
import { PromWeatherMetricsService } from './infrastructure/prom-weather-metrics.service';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    { provide: WeatherMetricsService, useClass: PromWeatherMetricsService },
    makeCounterProvider({
      name: 'weather_cache_hit_total',
      help: 'Number of times weather data was served from cache',
    }),
    makeCounterProvider({
      name: 'weather_cache_miss_total',
      help: 'Number of times weather data was fetched from API',
    }),
  ],
  exports: [WeatherMetricsService],
})
export class WeatherMetricsModule {}
