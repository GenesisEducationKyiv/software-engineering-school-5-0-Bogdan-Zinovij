import { Injectable } from '@nestjs/common';
import { SubscriptionEventPublisher } from './subscription-event-publisher.interface';
import { ConfirmationEmailRequestedEvent } from 'src/libs/kafka/dtos/confirmation-email-requested.event';
import { SubscriptionConfirmedEvent } from 'src/libs/kafka/dtos/subscription-confirmed.event';
import { UnsubscribedEvent } from 'src/libs/kafka/dtos/unsubscribed.event';
import { WeatherUpdateReadyEvent } from 'src/libs/kafka/dtos/weather-update-ready.event';
import { EventBus } from 'src/common/event-bus/domain/event-bus.interface';

@Injectable()
export class SubscriptionEventPublisherImpl
  implements SubscriptionEventPublisher
{
  constructor(private readonly eventBus: EventBus) {}

  publishConfirmationEmail(event: ConfirmationEmailRequestedEvent): void {
    this.eventBus.publish('notification.confirmation-email', event);
  }

  publishSubscriptionConfirmed(event: SubscriptionConfirmedEvent): void {
    this.eventBus.publish('notification.subscription-confirmed', event);
  }

  publishUnsubscribed(event: UnsubscribedEvent): void {
    this.eventBus.publish('notification.unsubscribed', event);
  }

  publishWeatherUpdate(event: WeatherUpdateReadyEvent): void {
    this.eventBus.publish('notification.weather-update', event);
  }
}
