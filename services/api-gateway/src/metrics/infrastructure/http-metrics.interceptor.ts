/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { GatewayMetricsService } from '../domain/gateway-metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: GatewayMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const route = req.route?.path || req.url;
    const method = req.method;
    const defaultStatus = res.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      tap(() =>
        this.metrics.incHttpRequests(
          route,
          method,
          res.statusCode || defaultStatus,
        ),
      ),
      catchError((err) => {
        const status = err.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        this.metrics.incHttpRequests(route, method, status);
        throw err;
      }),
    );
  }
}
