import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { GatewayMetricsService } from './domain/gateway-metrics.service';
import { PromGatewayMetricsService } from './infrastructure/prom-gateway-metrics.service';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    { provide: GatewayMetricsService, useClass: PromGatewayMetricsService },
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['route', 'method', 'statusCode'],
    }),
  ],
  exports: [GatewayMetricsService],
})
export class GatewayMetricsModule {}
