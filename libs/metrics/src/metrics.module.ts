import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { MetricsService } from './domain/metrics.service';
import { PromMetricsService } from './infrastructure/prom-metrics.service';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    {
      provide: MetricsService,
      useClass: PromMetricsService,
    },
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['route', 'method', 'statusCode'],
    }),
    makeCounterProvider({
      name: 'email_sent_total',
      help: 'Total number of successfully sent emails',
    }),
    makeCounterProvider({
      name: 'email_failed_total',
      help: 'Total number of failed email send attempts',
    }),
    makeCounterProvider({
      name: 'subscriptions_created_total',
      help: 'Total number of created subscriptions',
    }),
    makeCounterProvider({
      name: 'subscriptions_confirmed_total',
      help: 'Total number of confirmed subscriptions',
    }),
    makeCounterProvider({
      name: 'subscriptions_cancelled_total',
      help: 'Total number of cancelled subscriptions',
    }),
    makeCounterProvider({
      name: 'weather_cache_hit_total',
      help: 'Number of times weather data was served from cache',
    }),
    makeCounterProvider({
      name: 'weather_cache_miss_total',
      help: 'Number of times weather data was fetched from API',
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
