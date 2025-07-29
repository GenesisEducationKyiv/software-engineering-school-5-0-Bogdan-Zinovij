/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UseInterceptors,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { LoggerPort } from '@libs/logger';
import { MetricsService } from '@libs/metrics';

interface SubscriptionGrpcService {
  subscribe(dto: CreateSubscriptionDto): any;
  confirm(request: { token: string }): any;
  unsubscribe(request: { token: string }): any;
  sendTestWeather(request: { frequency: string }): any;
}

@Controller('subscription')
export class SubscriptionGatewayController {
  private subscriptionService: SubscriptionGrpcService;

  constructor(
    @Inject('SUBSCRIPTION_PACKAGE') private client: ClientGrpc,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

  onModuleInit() {
    this.subscriptionService = this.client.getService<SubscriptionGrpcService>(
      'SubscriptionService',
    );
  }

  @Post('subscribe')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() dto: CreateSubscriptionDto): Promise<void> {
    this.logger.info(
      `Received subscription request for ${dto.email} in ${dto.city}`,
      'ApiGateway',
    );

    try {
      await lastValueFrom(this.subscriptionService.subscribe(dto));
      this.logger.info(
        `Subscription request sent to SubscriptionService`,
        'ApiGateway',
      );
      this.metrics.incHttpRequests('/subscription/subscribe', 'POST', 200);
    } catch (err: any) {
      this.logger.error(
        `Subscription request failed`,
        err?.stack,
        'ApiGateway',
      );
      this.metrics.incHttpRequests(
        '/subscription/subscribe',
        'POST',
        err.code ?? 500,
      );

      const code = err.code;
      const message = err.details || 'Unknown error';

      switch (code) {
        case status.ALREADY_EXISTS:
          throw new ConflictException(message);
        case status.INVALID_ARGUMENT:
          throw new BadRequestException(message);
        default:
          throw new InternalServerErrorException(message);
      }
    }
  }

  @Get('confirm/:token')
  async confirm(@Param('token') token: string): Promise<void> {
    this.logger.info(
      `Received confirm request for token ${token}`,
      'ApiGateway',
    );

    try {
      await lastValueFrom(this.subscriptionService.confirm({ token }));
      this.logger.info(
        `SubscriptionService.confirm succeeded for token ${token}`,
        'ApiGateway',
      );
      this.metrics.incHttpRequests('/subscription/confirm/:token', 'GET', 200);
    } catch (err: any) {
      this.logger.error(
        `SubscriptionService.confirm failed`,
        err?.stack,
        'ApiGateway',
      );
      this.metrics.incHttpRequests(
        '/subscription/confirm/:token',
        'GET',
        err.code ?? 500,
      );

      const code = err.code;
      const message = err.details || 'Unknown error';

      switch (code) {
        case status.INVALID_ARGUMENT:
          throw new BadRequestException(message);
        case status.NOT_FOUND:
          throw new NotFoundException(message);
        default:
          throw new InternalServerErrorException(message);
      }
    }
  }

  @Get('unsubscribe/:token')
  @HttpCode(HttpStatus.OK)
  async unsubscribe(@Param('token') token: string): Promise<void> {
    this.logger.info(
      `Received unsubscribe request for token ${token}`,
      'ApiGateway',
    );

    try {
      await lastValueFrom(this.subscriptionService.unsubscribe({ token }));
      this.logger.info(
        `SubscriptionService.unsubscribe succeeded for token ${token}`,
        'ApiGateway',
      );
      this.metrics.incHttpRequests(
        '/subscription/unsubscribe/:token',
        'GET',
        200,
      );
    } catch (err: any) {
      this.logger.error(
        `SubscriptionService.unsubscribe failed`,
        err?.stack,
        'ApiGateway',
      );
      this.metrics.incHttpRequests(
        '/subscription/unsubscribe/:token',
        'GET',
        err.code ?? 500,
      );

      const code = err.code;
      const message = err.details || 'Unknown error';

      switch (code) {
        case status.INVALID_ARGUMENT:
          throw new BadRequestException(message);
        case status.NOT_FOUND:
          throw new NotFoundException(message);
        default:
          throw new InternalServerErrorException(message);
      }
    }
  }

  @Get('test')
  @HttpCode(HttpStatus.OK)
  async test(): Promise<void> {
    this.logger.info(
      `Received test weather request (frequency: daily)`,
      'ApiGateway',
    );

    try {
      await lastValueFrom(
        this.subscriptionService.sendTestWeather({ frequency: 'daily' }),
      );
      this.logger.info(
        `SubscriptionService.sendTestWeather succeeded`,
        'ApiGateway',
      );
    } catch (err: any) {
      this.logger.error(
        `SubscriptionService.sendTestWeather failed`,
        err?.stack,
        'ApiGateway',
      );

      const code = err.code;
      const message = err.details || 'Unknown error';

      switch (code) {
        case status.INVALID_ARGUMENT:
          throw new BadRequestException(message);
        default:
          throw new InternalServerErrorException(message);
      }
    }
  }
}
