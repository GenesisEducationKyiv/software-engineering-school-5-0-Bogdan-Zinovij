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

interface SubscriptionGrpcService {
  subscribe(dto: CreateSubscriptionDto): any;
  confirm(request: { token: string }): any;
  unsubscribe(request: { token: string }): any;
  sendTestWeather(request: { frequency: string }): any;
}

@Controller('subscription')
export class SubscriptionGatewayController {
  private subscriptionService: SubscriptionGrpcService;

  constructor(@Inject('SUBSCRIPTION_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.subscriptionService = this.client.getService<SubscriptionGrpcService>(
      'SubscriptionService',
    );
  }

  @Post('subscribe')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() dto: CreateSubscriptionDto): Promise<void> {
    try {
      await lastValueFrom(this.subscriptionService.subscribe(dto));
    } catch (err: any) {
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
    try {
      await lastValueFrom(this.subscriptionService.confirm({ token }));
    } catch (err: any) {
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
    try {
      await lastValueFrom(this.subscriptionService.unsubscribe({ token }));
    } catch (err: any) {
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
    try {
      await lastValueFrom(
        this.subscriptionService.sendTestWeather({ frequency: 'daily' }),
      );
    } catch (err: any) {
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
