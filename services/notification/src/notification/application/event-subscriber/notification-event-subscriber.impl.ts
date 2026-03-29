import { Injectable } from '@nestjs/common';
import { NotificationService } from '../../application/notification.service';
import { ConfirmationEmailRequestedEvent } from 'src/libs/kafka/dtos/confirmation-email-requested.event';
import { SubscriptionConfirmedEvent } from 'src/libs/kafka/dtos/subscription-confirmed.event';
import { UnsubscribedEvent } from 'src/libs/kafka/dtos/unsubscribed.event';
import { WeatherUpdateReadyEvent } from 'src/libs/kafka/dtos/weather-update-ready.event';
import { NotificationEventSubscriber } from './notification-event-subscriber.interface';
import { EventBus } from 'src/common/event-bus/domain/event-bus.abstract';

@Injectable()
export class NotificationEventSubscriberImpl
  implements NotificationEventSubscriber
{
  constructor(
    private readonly bus: EventBus,
    private readonly service: NotificationService,
  ) {}

  subscribeToAll(): void {
    this.bus.subscribe<ConfirmationEmailRequestedEvent>(
      'notification.confirmation-email',
      (event) => this.service.sendConfirmationEmail(event),
    );

    this.bus.subscribe<SubscriptionConfirmedEvent>(
      'notification.subscription-confirmed',
      (event) => this.service.sendSubscriptionConfirmedEmail(event),
    );

    this.bus.subscribe<UnsubscribedEvent>(
      'notification.unsubscribed',

      (event) => this.service.sendUnsubscribeSuccess(event.email),
    );

    this.bus.subscribe<WeatherUpdateReadyEvent>(
      'notification.weather-update',
      (event) => this.service.sendWeatherUpdate(event),
    );
  }
}
