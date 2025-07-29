import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { GatewayMetricsService } from '../domain/gateway-metrics.service';
import { NotificationMetricsService } from '../domain/notification-metrics.service';
import { SubscriptionMetricsService } from '../domain/subscription-metrics.service';
import { WeatherMetricsService } from '../domain/weather-metrics.service';

@Injectable()
export class PromMetricsService
  implements
    WeatherMetricsService,
    NotificationMetricsService,
    SubscriptionMetricsService,
    GatewayMetricsService
{
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter,

    @InjectMetric('email_sent_total')
    private readonly emailSentTotal: Counter,

    @InjectMetric('email_failed_total')
    private readonly emailFailedTotal: Counter,

    @InjectMetric('subscriptions_created_total')
    private readonly subscriptionsCreatedTotal: Counter,

    @InjectMetric('subscriptions_confirmed_total')
    private readonly subscriptionsConfirmedTotal: Counter,

    @InjectMetric('subscriptions_cancelled_total')
    private readonly subscriptionsCancelledTotal: Counter,

    @InjectMetric('weather_cache_hit_total')
    private readonly weatherCacheHit: Counter,

    @InjectMetric('weather_cache_miss_total')
    private readonly weatherCacheMiss: Counter
  ) {}

  incHttpRequests(route: string, method: string, statusCode: number): void {
    this.httpRequestsTotal.inc({
      route,
      method,
      statusCode: statusCode.toString(),
    });
  }

  incEmailSent(): void {
    this.emailSentTotal.inc();
  }

  incEmailFailed(): void {
    this.emailFailedTotal.inc();
  }

  incSubscriptionCreated(): void {
    this.subscriptionsCreatedTotal.inc();
  }

  incSubscriptionConfirmed(): void {
    this.subscriptionsConfirmedTotal.inc();
  }

  incSubscriptionCancelled(): void {
    this.subscriptionsCancelledTotal.inc();
  }

  incWeatherCacheHit(): void {
    this.weatherCacheHit.inc();
  }

  incWeatherCacheMiss(): void {
    this.weatherCacheMiss.inc();
  }
}
