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
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const route = request.route?.path || request.url;
    const method = request.method;
    const defaultStatusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      tap(() => {
        this.metrics.incHttpRequests(
          route,
          method,
          response.statusCode || defaultStatusCode
        );
      }),
      catchError((err) => {
        const statusCode = err.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        this.metrics.incHttpRequests(route, method, statusCode);
        throw err;
      })
    );
  }
}
