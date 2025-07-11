/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ConfirmationEmailDto } from './dto/confirmation-email.dto';
import { SubscriptionConfirmedEmailDto } from './dto/subscription-confirmed-email.dto';
import { WeatherUpdateEmailDto } from './dto/weather-update-email.dto';

interface NotificationServiceGrpc {
  sendConfirmationEmail(data: any): any;
  sendSubscriptionConfirmedEmail(data: any): any;
  sendUnsubscribeSuccess(data: { email: string }): any;
  sendWeatherUpdate(data: any): any;
}

@Injectable()
export class NotificationGrpcClientService implements OnModuleInit {
  private notificationService: NotificationServiceGrpc;

  constructor(@Inject('NOTIFICATION_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.notificationService = this.client.getService<NotificationServiceGrpc>(
      'NotificationService',
    );
  }

  sendConfirmationEmail(data: ConfirmationEmailDto): Promise<void> {
    return lastValueFrom(this.notificationService.sendConfirmationEmail(data));
  }

  sendSubscriptionConfirmedEmail(
    data: SubscriptionConfirmedEmailDto,
  ): Promise<void> {
    return lastValueFrom(
      this.notificationService.sendSubscriptionConfirmedEmail(data),
    );
  }

  sendUnsubscribeSuccess(email: string): Promise<void> {
    return lastValueFrom(
      this.notificationService.sendUnsubscribeSuccess({ email }),
    );
  }

  sendWeatherUpdate(data: WeatherUpdateEmailDto): Promise<void> {
    return lastValueFrom(this.notificationService.sendWeatherUpdate(data));
  }
}
