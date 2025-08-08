import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ConfirmationEmailDto } from './dto/confirmation-email.dto';
import { SubscriptionConfirmedEmailDto } from './dto/subscription-confirmed-email.dto';
import { WeatherUpdateEmailDto } from './dto/weather-update-email.dto';

@Injectable()
export class NotificationHttpService {
  constructor(
    private readonly httpService: HttpService,
    @Inject('NOTIFICATION_URL')
    private readonly NOTIFICATION_URL: string,
  ) {}

  async sendConfirmationEmail(data: ConfirmationEmailDto): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${this.NOTIFICATION_URL}/notification/confirmation`,
        data,
      ),
    );
  }

  async sendSubscriptionConfirmedEmail(
    data: SubscriptionConfirmedEmailDto,
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${this.NOTIFICATION_URL}/notification/confirmed`,
        data,
      ),
    );
  }

  async sendUnsubscribeSuccess(email: string): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${this.NOTIFICATION_URL}/notification/unsubscribe`,
        { email },
      ),
    );
  }

  async sendWeatherUpdate(data: WeatherUpdateEmailDto): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${this.NOTIFICATION_URL}/notification/weather`,
        data,
      ),
    );
  }
}
