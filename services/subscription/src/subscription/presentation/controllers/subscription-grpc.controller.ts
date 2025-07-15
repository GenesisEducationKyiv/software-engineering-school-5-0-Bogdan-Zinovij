/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { SubscriptionService } from 'src/subscription/application/subscription.service';
import { SubscriptionErrorCode } from 'src/subscription/constants/subscription.errors';
import { TokenErrorCode } from 'src/token/constants/token.errors';
import { HTTP_ERROR_MESSAGES } from 'src/common/constants/http.constants';
import { status } from '@grpc/grpc-js';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

@Controller()
export class SubscriptionGrpcController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @GrpcMethod('SubscriptionService', 'Subscribe')
  async subscribe(dto: CreateSubscriptionDto): Promise<{}> {
    try {
      await this.subscriptionService.subscribe(dto);
      return {};
    } catch (err) {
      switch (err.message) {
        case SubscriptionErrorCode.EMAIL_ALREADY_SUBSCRIBED:
          throw new RpcException({
            code: status.ALREADY_EXISTS,
            message: HTTP_ERROR_MESSAGES.EMAIL_ALREADY_SUBSCRIBED,
          });
        default:
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: HTTP_ERROR_MESSAGES.INVALID_INPUT,
          });
      }
    }
  }

  @GrpcMethod('SubscriptionService', 'Confirm')
  async confirm({ token }: { token: string }): Promise<{}> {
    try {
      await this.subscriptionService.confirm(token);
      return {};
    } catch (err) {
      switch (err.message) {
        case TokenErrorCode.INVALID_TOKEN:
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: HTTP_ERROR_MESSAGES.INVALID_TOKEN,
          });
        case TokenErrorCode.TOKEN_NOT_FOUND:
        case SubscriptionErrorCode.TOKEN_NOT_FOUND:
          throw new RpcException({
            code: status.NOT_FOUND,
            message: HTTP_ERROR_MESSAGES.TOKEN_NOT_FOUND,
          });
        default:
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: HTTP_ERROR_MESSAGES.INVALID_INPUT,
          });
      }
    }
  }

  @GrpcMethod('SubscriptionService', 'Unsubscribe')
  async unsubscribe({ token }: { token: string }): Promise<{}> {
    try {
      await this.subscriptionService.unsubscribe(token);
      return {};
    } catch (err) {
      console.error('[gRPC unsubscribe] Error message:', err.message);
      switch (err.message) {
        case TokenErrorCode.INVALID_TOKEN:
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: HTTP_ERROR_MESSAGES.INVALID_TOKEN,
          });
        case TokenErrorCode.TOKEN_NOT_FOUND:
        case SubscriptionErrorCode.TOKEN_NOT_FOUND:
          throw new RpcException({
            code: status.NOT_FOUND,
            message: HTTP_ERROR_MESSAGES.TOKEN_NOT_FOUND,
          });
        default:
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: HTTP_ERROR_MESSAGES.INVALID_INPUT,
          });
      }
    }
  }

  @GrpcMethod('SubscriptionService', 'SendTestWeather')
  async sendTestWeather({ frequency }: { frequency: string }): Promise<{}> {
    await this.subscriptionService.sendWeatherToSubscribers(
      frequency as SubscriptionFrequencyEnum,
    );
    return {};
  }
}
