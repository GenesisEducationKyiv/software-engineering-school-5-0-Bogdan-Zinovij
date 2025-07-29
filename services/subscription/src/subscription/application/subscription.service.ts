import { Injectable, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from '../presentation/dtos/create-subscription.dto';
import { Subscription } from '../domain/subscription.model';
import { SubscriptionRepository } from '../domain/subscription.repository.interface';
import { TokenService } from 'src/token/application/token.service';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { SubscriptionErrorCode } from '../constants/subscription.errors';
import { WeatherGrpcClientService } from '../infrastructure/weather/weather-grpc.client';
import { ConfirmationEmailRequestedEvent } from 'src/libs/kafka/dtos/confirmation-email-requested.event';
import { SubscriptionConfirmedEvent } from 'src/libs/kafka/dtos/subscription-confirmed.event';
import { UnsubscribedEvent } from 'src/libs/kafka/dtos/unsubscribed.event';
import { WeatherUpdateReadyEvent } from 'src/libs/kafka/dtos/weather-update-ready.event';
import { SubscriptionEventPublisher } from './event-publisher/subscription-event-publisher.interface';
import { LoggerPort } from '@libs/logger';
import { MetricsService } from '@libs/metrics';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly publisher: SubscriptionEventPublisher,
    private readonly tokenService: TokenService,
    private readonly weatherService: WeatherGrpcClientService,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto): Promise<Subscription> {
    this.logger.info(
      `New subscription attempt: ${dto.email} -> ${dto.city} (${dto.frequency})`,
      'SubscriptionService',
    );

    const existing = await this.subscriptionRepository.find({
      email: dto.email,
      city: dto.city,
      frequency: dto.frequency,
    });
    if (existing.length > 0) {
      throw new Error(SubscriptionErrorCode.EMAIL_ALREADY_SUBSCRIBED);
    }

    const token = await this.tokenService.create();

    const subscription = await this.subscriptionRepository.create({
      email: dto.email,
      city: dto.city,
      frequency: dto.frequency,
      confirmed: false,
      tokenId: token.id,
    });

    this.publisher.publishConfirmationEmail(
      new ConfirmationEmailRequestedEvent(subscription.email, token.value),
    );

    this.logger.info(
      `Subscription created, confirmation email event published`,
      'SubscriptionService',
    );
    this.metrics.incSubscriptionCreated();

    return subscription;
  }

  async confirm(tokenValue: string): Promise<Subscription> {
    this.logger.info(
      `Confirming subscription with token ${tokenValue}`,
      'SubscriptionService',
    );

    const token = await this.tokenService.findByValue(tokenValue);

    const found = await this.subscriptionRepository.find({ tokenId: token.id });
    if (found.length === 0) {
      throw new Error(SubscriptionErrorCode.TOKEN_NOT_FOUND);
    }

    let subscription = found[0];
    if (!subscription.confirmed) {
      subscription = (await this.subscriptionRepository.update(
        subscription.id,
        { confirmed: true },
      )) as Subscription;
    }

    const weather = await this.weatherService.getCurrentWeather(
      subscription.city,
    );

    this.publisher.publishSubscriptionConfirmed(
      new SubscriptionConfirmedEvent(
        subscription.email,
        subscription.frequency,
        subscription.city,
        weather,
        token.value,
      ),
    );

    this.logger.info(
      `Subscription confirmed for ${subscription.email}`,
      'SubscriptionService',
    );
    this.metrics.incSubscriptionConfirmed();

    return subscription;
  }

  async unsubscribe(tokenValue: string): Promise<void> {
    this.logger.info(
      `Unsubscribe request for token ${tokenValue}`,
      'SubscriptionService',
    );

    const token = await this.tokenService.findByValue(tokenValue);

    const subscriptions = await this.subscriptionRepository.find({
      tokenId: token.id,
    });

    if (subscriptions.length === 0) {
      throw new Error(SubscriptionErrorCode.TOKEN_NOT_FOUND);
    }

    const subscription = subscriptions[0];
    await this.subscriptionRepository.remove(subscription.id);
    await this.tokenService.remove(token.id);

    this.publisher.publishUnsubscribed(
      new UnsubscribedEvent(subscription.email),
    );

    this.logger.info(
      `Unsubscribed: ${subscription.email}`,
      'SubscriptionService',
    );
    this.metrics.incSubscriptionCancelled();
  }

  async getConfirmedSubscriptionsByFrequency(
    frequency: SubscriptionFrequencyEnum,
  ): Promise<Subscription[]> {
    return this.subscriptionRepository.find({ frequency, confirmed: true });
  }

  async sendWeatherToSubscribers(
    frequency: SubscriptionFrequencyEnum,
  ): Promise<void> {
    this.logger.debug(
      `Sending weather updates to ${frequency} subscribers`,
      'SubscriptionService',
    );

    const subscribers =
      await this.getConfirmedSubscriptionsByFrequency(frequency);

    for (const sub of subscribers) {
      try {
        const weather = await this.weatherService.getCurrentWeather(sub.city);

        const token = await this.tokenService.findById(sub.tokenId);

        this.publisher.publishWeatherUpdate(
          new WeatherUpdateReadyEvent(
            sub.email,
            sub.city,
            weather,
            token.value,
          ),
        );
      } catch (err) {
        console.error(`Failed to send weather to ${sub.email}:`, err);
      }
    }

    this.logger.info(
      `Weather update events published for ${frequency} subscribers`,
      'SubscriptionService',
    );
  }
}
