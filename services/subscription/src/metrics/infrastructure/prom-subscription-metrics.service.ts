import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { SubscriptionMetricsService } from '../domain/subscription-metrics.service';

@Injectable()
export class PromSubscriptionMetricsService
  implements SubscriptionMetricsService
{
  constructor(
    @InjectMetric('subscriptions_created_total')
    private readonly subscriptionsCreatedTotal: Counter,
    @InjectMetric('subscriptions_confirmed_total')
    private readonly subscriptionsConfirmedTotal: Counter,
    @InjectMetric('subscriptions_cancelled_total')
    private readonly subscriptionsCancelledTotal: Counter,
  ) {}

  incSubscriptionCreated(): void {
    this.subscriptionsCreatedTotal.inc();
  }
  incSubscriptionConfirmed(): void {
    this.subscriptionsConfirmedTotal.inc();
  }
  incSubscriptionCancelled(): void {
    this.subscriptionsCancelledTotal.inc();
  }
}
