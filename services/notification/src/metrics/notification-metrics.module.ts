import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { NotificationMetricsService } from './domain/notification-metrics.service';
import { PromNotificationMetricsService } from './infrastructure/prom-notification-metrics.service';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    {
      provide: NotificationMetricsService,
      useClass: PromNotificationMetricsService,
    },
    makeCounterProvider({
      name: 'email_sent_total',
      help: 'Total number of successfully sent emails',
    }),
    makeCounterProvider({
      name: 'email_failed_total',
      help: 'Total number of failed email send attempts',
    }),
  ],
  exports: [NotificationMetricsService],
})
export class NotificationMetricsModule {}
