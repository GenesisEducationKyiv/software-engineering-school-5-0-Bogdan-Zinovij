import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { GatewayMetricsService } from '../domain/gateway-metrics.service';

@Injectable()
export class PromGatewayMetricsService implements GatewayMetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter,
  ) {}

  incHttpRequests(route: string, method: string, statusCode: number): void {
    this.httpRequestsTotal.inc({
      route,
      method,
      statusCode: statusCode.toString(),
    });
  }
}
