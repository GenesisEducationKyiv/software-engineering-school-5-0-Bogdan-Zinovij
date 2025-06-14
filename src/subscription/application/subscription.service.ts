import { Injectable, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { Subscription } from '../domain/subscription.model';
import { SubscriptionRepository } from '../domain/subscription.repository.interface';
import { WeatherService } from 'src/weather/application/weather.service';
import { Weather } from 'src/weather/domain/weather.model';
import { TokenService } from 'src/token/application/token.service';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { SubscriptionErrorCode } from '../constants/subscription.errors';
import { ConfigService } from '@nestjs/config';
import { SubscriptionNotificationService } from './notification/subscription-notification.service';

@Injectable()
export class SubscriptionService {
  private readonly appPort: string;
  private readonly appDomain: string;

  constructor(
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly tokenService: TokenService,
    private readonly weatherService: WeatherService,
    private readonly notificationService: SubscriptionNotificationService,
    private readonly configService: ConfigService,
  ) {
    this.appPort = this.configService.get<string>('APP_PORT') ?? '3000';
    this.appDomain =
      this.configService.get<string>('APP_DOMAIN') ?? 'localhost';
  }

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

    await this.notificationService.sendConfirmationEmail(
      subscription.email,
      token.value,
      this.appDomain,
      this.appPort,
    );

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
        {
          confirmed: true,
        },
      )) as Subscription;
    }

    const weather = await this.weatherService.getCurrentWeather(
      subscription.city,
    );

    await this.notificationService.sendSubscriptionConfirmedEmail(
      subscription.email,
      subscription.frequency,
      subscription.city,
      weather,
      token.value,
      this.appDomain,
      this.appPort,
    );

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

    await this.notificationService.sendUnsubscribeSuccess(subscription.email);
  }

  async getConfirmedSubscriptionsByFrequency(
    frequency: SubscriptionFrequencyEnum,
  ): Promise<Subscription[]> {
    return this.subscriptionRepository.find({ frequency, confirmed: true });
  }

  async sendWeatherToSubscribers(
    frequency: SubscriptionFrequencyEnum,
  ): Promise<void> {
    const subscribers =
      await this.getConfirmedSubscriptionsByFrequency(frequency);

    const weatherCache = new Map<string, Weather>();

    for (const sub of subscribers) {
      try {
        let weather: Weather;
        if (weatherCache.has(sub.city)) {
          weather = weatherCache.get(sub.city)!;
        } else {
          weather = await this.weatherService.getCurrentWeather(sub.city);
          weatherCache.set(sub.city, weather);
        }

        const token = await this.tokenService.findById(sub.tokenId);

        await this.notificationService.sendWeatherUpdate(
          sub.email,
          sub.city,
          weather,
          token.value,
          this.appDomain,
          this.appPort,
        );
      } catch (err) {
        console.error(`Failed to send weather to ${sub.email}:`, err);
      }
    }
  }
}
