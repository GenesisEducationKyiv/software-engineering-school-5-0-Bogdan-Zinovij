import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationService } from '../../application/notification.service';
import { ConfirmationEmailDto } from '../dto/confirmation-email.dto';
import { SubscriptionConfirmedEmailDto } from '../dto/subscription-confirmed-email.dto';
import { WeatherUpdateEmailDto } from '../dto/weather-update-email.dto';

@Controller()
export class NotificationGrpcController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod('NotificationService', 'SendConfirmationEmail')
  sendConfirmationEmail(data: ConfirmationEmailDto): Promise<void> {
    return this.notificationService.sendConfirmationEmail(data);
  }

  @GrpcMethod('NotificationService', 'SendSubscriptionConfirmedEmail')
  sendSubscriptionConfirmedEmail(
    data: SubscriptionConfirmedEmailDto,
  ): Promise<void> {
    return this.notificationService.sendSubscriptionConfirmedEmail(data);
  }

  @GrpcMethod('NotificationService', 'SendUnsubscribeSuccess')
  sendUnsubscribeSuccess(data: { email: string }): Promise<void> {
    return this.notificationService.sendUnsubscribeSuccess(data.email);
  }

  @GrpcMethod('NotificationService', 'SendWeatherUpdate')
  sendWeatherUpdate(data: WeatherUpdateEmailDto): Promise<void> {
    return this.notificationService.sendWeatherUpdate(data);
  }
}
