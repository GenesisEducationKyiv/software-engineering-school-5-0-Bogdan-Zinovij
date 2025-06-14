/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { WeatherService } from 'src/weather/application/weather.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { SubscriptionRepository } from '../domain/subscription.repository.interface';
import { TokenService } from 'src/token/application/token.service';
import { Subscription } from '../domain/subscription.model';
import { SubscriptionNotificationService } from './notification/subscription-notification.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repo: jest.Mocked<SubscriptionRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let weatherService: jest.Mocked<WeatherService>;
  let notificationService: jest.Mocked<SubscriptionNotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: 'SubscriptionRepository',
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            create: jest.fn(),
            findByValue: jest.fn(),
            findById: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: WeatherService,
          useValue: { getCurrentWeather: jest.fn() },
        },
        {
          provide: SubscriptionNotificationService,
          useValue: {
            sendConfirmationEmail: jest.fn(),
            sendSubscriptionConfirmedEmail: jest.fn(),
            sendUnsubscribeSuccess: jest.fn(),
            sendWeatherUpdate: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'APP_PORT' ? '3000' : 'localhost',
            ),
          },
        },
      ],
    }).compile();

    service = module.get(SubscriptionService);
    repo = module.get('SubscriptionRepository');
    tokenService = module.get(TokenService);
    weatherService = module.get(WeatherService);
    notificationService = module.get(SubscriptionNotificationService);
  });

  it('should subscribe a new user and send confirmation email', async () => {
    repo.find.mockResolvedValue([]);
    tokenService.create.mockResolvedValue({ id: 'token-id', value: 'abc' });
    repo.create.mockResolvedValue({
      id: '1',
      email: 'test@mail.com',
      city: 'Kyiv',
      frequency: SubscriptionFrequencyEnum.HOURLY,
      confirmed: false,
      tokenId: 'token-id',
    });

    await service.subscribe({
      email: 'test@mail.com',
      city: 'Kyiv',
      frequency: SubscriptionFrequencyEnum.HOURLY,
    });

    expect(notificationService.sendConfirmationEmail).toHaveBeenCalledWith(
      'test@mail.com',
      'abc',
      'localhost',
      '3000',
    );
  });

  it('should confirm subscription and send confirmation message with weather', async () => {
    tokenService.findByValue.mockResolvedValue({
      id: 'token-id',
      value: 'abc',
    });
    repo.find.mockResolvedValue([
      new Subscription(
        '1',
        'test@mail.com',
        'Kyiv',
        SubscriptionFrequencyEnum.HOURLY,
        false,
        'token-id',
      ),
    ]);
    repo.update.mockResolvedValue({
      id: '1',
      email: 'test@mail.com',
      city: 'Kyiv',
      frequency: SubscriptionFrequencyEnum.HOURLY,
      confirmed: true,
      tokenId: 'token-id',
    });
    weatherService.getCurrentWeather.mockResolvedValue({
      temperature: 18,
      humidity: 40,
      description: 'Sunny',
    });

    const result = await service.confirm('abc');

    expect(result.confirmed).toBe(true);
    expect(
      notificationService.sendSubscriptionConfirmedEmail,
    ).toHaveBeenCalledWith(
      'test@mail.com',
      SubscriptionFrequencyEnum.HOURLY,
      'Kyiv',
      { temperature: 18, humidity: 40, description: 'Sunny' },
      'abc',
      'localhost',
      '3000',
    );
  });

  it('should unsubscribe a user and send success email', async () => {
    tokenService.findByValue.mockResolvedValue({
      id: 'token-id',
      value: 'abc',
    });
    repo.find.mockResolvedValue([
      new Subscription(
        '1',
        'test@mail.com',
        'Kyiv',
        SubscriptionFrequencyEnum.HOURLY,
        true,
        'token-id',
      ),
    ]);

    await service.unsubscribe('abc');

    expect(repo.remove).toHaveBeenCalledWith('1');
    expect(notificationService.sendUnsubscribeSuccess).toHaveBeenCalledWith(
      'test@mail.com',
    );
  });

  it('should send weather updates to subscribers', async () => {
    repo.find.mockResolvedValue([
      new Subscription(
        '1',
        'test@mail.com',
        'Kyiv',
        SubscriptionFrequencyEnum.HOURLY,
        true,
        'token-id',
      ),
    ]);
    weatherService.getCurrentWeather.mockResolvedValue({
      temperature: 20,
      humidity: 50,
      description: 'Clear',
    });
    tokenService.findById.mockResolvedValue({ id: 'token-id', value: 'abc' });

    await service.sendWeatherToSubscribers(SubscriptionFrequencyEnum.HOURLY);

    expect(notificationService.sendWeatherUpdate).toHaveBeenCalledWith(
      'test@mail.com',
      'Kyiv',
      { temperature: 20, humidity: 50, description: 'Clear' },
      'abc',
      'localhost',
      '3000',
    );
  });
});
