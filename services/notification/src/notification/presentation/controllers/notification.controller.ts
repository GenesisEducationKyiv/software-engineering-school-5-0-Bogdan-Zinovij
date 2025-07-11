import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { NotificationService } from 'src/notification/application/notification.service';
import { ConfirmationEmailDto } from 'src/notification/presentation/dto/confirmation-email.dto';
import { SubscriptionConfirmedEmailDto } from 'src/notification/presentation/dto/subscription-confirmed-email.dto';
import { WeatherUpdateEmailDto } from 'src/notification/presentation/dto/weather-update-email.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('confirmation')
  @HttpCode(HttpStatus.OK)
  sendConfirmationEmail(@Body() data: ConfirmationEmailDto) {
    return this.notificationService.sendConfirmationEmail(data);
  }

  @Post('confirmed')
  @HttpCode(HttpStatus.OK)
  sendSubscriptionConfirmedEmail(@Body() data: SubscriptionConfirmedEmailDto) {
    return this.notificationService.sendSubscriptionConfirmedEmail(data);
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  sendUnsubscribeSuccess(@Body('email') email: string) {
    return this.notificationService.sendUnsubscribeSuccess(email);
  }

  @Post('weather')
  @HttpCode(HttpStatus.OK)
  sendWeatherUpdate(@Body() data: WeatherUpdateEmailDto) {
    return this.notificationService.sendWeatherUpdate(data);
  }
}
