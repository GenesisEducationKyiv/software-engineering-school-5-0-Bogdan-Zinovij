import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { SubscriptionMetricsService } from './domain/subscription-metrics.service';
import { PromSubscriptionMetricsService } from './infrastructure/prom-subscription-metrics.service';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    {
      provide: SubscriptionMetricsService,
      useClass: PromSubscriptionMetricsService,
    },
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
  ],
  exports: [SubscriptionMetricsService],
})
export class SubscriptionMetricsModule {}
