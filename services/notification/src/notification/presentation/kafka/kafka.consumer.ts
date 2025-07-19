import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from '../../application/notification.service';
import { ConfirmationEmailRequestedEvent } from 'src/libs/kafka/dtos/confirmation-email-requested.event';
import { SubscriptionConfirmedEvent } from 'src/libs/kafka/dtos/subscription-confirmed.event';
import { UnsubscribedEvent } from 'src/libs/kafka/dtos/unsubscribed.event';
import { WeatherUpdateReadyEvent } from 'src/libs/kafka/dtos/weather-update-ready.event';

@Controller()
export class NotificationKafkaConsumer {
  constructor(private readonly service: NotificationService) {}

  @EventPattern('notification.confirmation-email')
  async handleConfirmationEmail(
    @Payload() data: ConfirmationEmailRequestedEvent,
  ) {
    await this.service.sendConfirmationEmail(data);
  }

  @EventPattern('notification.subscription-confirmed')
  async handleSubscriptionConfirmed(
    @Payload() data: SubscriptionConfirmedEvent,
  ) {
    await this.service.sendSubscriptionConfirmedEmail(data);
  }

  @EventPattern('notification.unsubscribed')
  async handleUnsubscribed(@Payload() data: UnsubscribedEvent) {
    await this.service.sendUnsubscribeSuccess(data.email);
  }

  @EventPattern('notification.weather-update')
  async handleWeatherUpdate(@Payload() data: WeatherUpdateReadyEvent) {
    await this.service.sendWeatherUpdate(data);
  }
}
