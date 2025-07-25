import { ConfirmationEmailRequestedEvent } from 'src/libs/kafka/dtos/confirmation-email-requested.event';
import { SubscriptionConfirmedEvent } from 'src/libs/kafka/dtos/subscription-confirmed.event';
import { UnsubscribedEvent } from 'src/libs/kafka/dtos/unsubscribed.event';
import { WeatherUpdateReadyEvent } from 'src/libs/kafka/dtos/weather-update-ready.event';

export abstract class SubscriptionEventPublisher {
  abstract publishConfirmationEmail(
    event: ConfirmationEmailRequestedEvent,
  ): void;
  abstract publishSubscriptionConfirmed(
    event: SubscriptionConfirmedEvent,
  ): void;
  abstract publishUnsubscribed(event: UnsubscribedEvent): void;
  abstract publishWeatherUpdate(event: WeatherUpdateReadyEvent): void;
}
