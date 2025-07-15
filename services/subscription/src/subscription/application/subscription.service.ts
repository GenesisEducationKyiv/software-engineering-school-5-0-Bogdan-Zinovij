import { Injectable, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from '../presentation/dtos/create-subscription.dto';
import { Subscription } from '../domain/subscription.model';
import { SubscriptionRepository } from '../domain/subscription.repository.interface';
import { WeatherHttpClientService } from '../infrastructure/weather/weather-http.client';
import { TokenService } from 'src/token/application/token.service';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { SubscriptionErrorCode } from '../constants/subscription.errors';
import { NotificationHttpService } from '../infrastructure/notification/notification-http-service';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly tokenService: TokenService,
    private readonly weatherService: WeatherHttpClientService,
    private readonly notificationHttpService: NotificationHttpService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto): Promise<Subscription> {
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

    await this.notificationHttpService.sendConfirmationEmail({
      email: subscription.email,
      token: token.value,
    });

    return subscription;
  }

  async confirm(tokenValue: string): Promise<Subscription> {
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

    await this.notificationHttpService.sendSubscriptionConfirmedEmail({
      email: subscription.email,
      frequency: subscription.frequency,
      city: subscription.city,
      weather,
      token: token.value,
    });

    return subscription;
  }

  async unsubscribe(tokenValue: string): Promise<void> {
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

    await this.notificationHttpService.sendUnsubscribeSuccess(
      subscription.email,
    );
  }

  async getConfirmedSubscriptionsByFrequency(
    frequency: SubscriptionFrequencyEnum,
  ): Promise<Subscription[]> {
    return this.subscriptionRepository.find({ frequency, confirmed: true });
  }

  async sendWeatherToSubscribers(
    frequency: SubscriptionFrequencyEnum,
  ): Promise<void> {
    // Test
    // const subscribers = await this.subscriptionRepository.find({ frequency });

    const subscribers =
      await this.getConfirmedSubscriptionsByFrequency(frequency);

    for (const sub of subscribers) {
      try {
        const weather = await this.weatherService.getCurrentWeather(sub.city);

        const token = await this.tokenService.findById(sub.tokenId);

        void this.notificationHttpService.sendWeatherUpdate({
          email: sub.email,
          city: sub.city,
          weather,
          token: token.value,
        });
      } catch (err) {
        console.error(`Failed to send weather to ${sub.email}:`, err);
      }
    }
  }
}
