import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { SubscriptionEventPublisher } from '../../application/ports/subscription-event.publisher.interface';
import { ConfirmationEmailRequestedEvent } from 'src/libs/kafka/dtos/confirmation-email-requested.event';
import { SubscriptionConfirmedEvent } from 'src/libs/kafka/dtos/subscription-confirmed.event';
import { UnsubscribedEvent } from 'src/libs/kafka/dtos/unsubscribed.event';
import { WeatherUpdateReadyEvent } from 'src/libs/kafka/dtos/weather-update-ready.event';

@Injectable()
export class KafkaSubscriptionEventPublisher
  implements SubscriptionEventPublisher, OnModuleInit
{
  constructor(
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  publishConfirmationEmail(event: ConfirmationEmailRequestedEvent): void {
    this.kafkaClient.emit('notification.confirmation-email', {
      value: JSON.stringify(event),
    });
  }

  publishSubscriptionConfirmed(event: SubscriptionConfirmedEvent): void {
    this.kafkaClient.emit('notification.subscription-confirmed', {
      value: JSON.stringify(event),
    });
  }

  publishUnsubscribed(event: UnsubscribedEvent): void {
    this.kafkaClient.emit('notification.unsubscribed', {
      value: JSON.stringify(event),
    });
  }

  publishWeatherUpdate(event: WeatherUpdateReadyEvent): void {
    this.kafkaClient.emit('notification.weather-update', {
      value: JSON.stringify(event),
    });
  }
}
