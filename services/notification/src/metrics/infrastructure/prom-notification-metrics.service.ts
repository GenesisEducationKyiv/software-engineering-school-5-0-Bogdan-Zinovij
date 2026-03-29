import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { NotificationMetricsService } from '../domain/notification-metrics.service';

@Injectable()
export class PromNotificationMetricsService
  implements NotificationMetricsService
{
  constructor(
    @InjectMetric('email_sent_total')
    private readonly emailSentTotal: Counter,
    @InjectMetric('email_failed_total')
    private readonly emailFailedTotal: Counter,
  ) {}

  incEmailSent(): void {
    this.emailSentTotal.inc();
  }

  incEmailFailed(): void {
    this.emailFailedTotal.inc();
  }
}
