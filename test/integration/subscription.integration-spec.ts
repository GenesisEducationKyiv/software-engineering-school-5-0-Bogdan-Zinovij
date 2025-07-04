/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupTestApp, teardownTestApp } from './setup-test-app';
import { SubscriptionRepository } from 'src/subscription/domain/subscription.repository.interface';
import { TokenRepository } from 'src/token/domain/token.repository.interface';
import { WeatherService } from 'src/weather/application/weather.service';
import { SubscriptionNotificationService } from 'src/subscription/application/notification/subscription-notification.service';
import { Token } from 'src/token/domain/token.domain';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { MailSender } from 'src/mail/domain/mail-sender';

describe('SubscriptionController (Integration)', () => {
  let app: INestApplication;
  let server: any;
  let subscriptionRepo: SubscriptionRepository;
  let tokenRepo: TokenRepository;

  const mockMailService = {
    sendMail: jest.fn(),
  };

  const mockWeatherService = {
    getCurrentWeather: jest.fn().mockResolvedValue({
      temperature: 20,
      humidity: 50,
      description: 'Sunny',
    }),
  };

  const mockNotificationService = {
    sendConfirmationEmail: jest.fn(),
    sendSubscriptionConfirmedEmail: jest.fn(),
    sendUnsubscribeSuccess: jest.fn(),
    sendWeatherUpdate: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailSender)
      .useValue(mockMailService)
      .overrideProvider(SubscriptionNotificationService)
      .useValue(mockNotificationService)
      .overrideProvider(WeatherService)
      .useValue(mockWeatherService)
      .compile();

    app = moduleFixture.createNestApplication();
    await setupTestApp(app);
    server = app.getHttpServer();

    subscriptionRepo = moduleFixture.get<SubscriptionRepository>(
      'SubscriptionRepository',
    );
    tokenRepo = moduleFixture.get<TokenRepository>('TokenRepository');
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  beforeEach(async () => {
    const subscriptions = await subscriptionRepo.find({});
    for (const s of subscriptions) {
      await subscriptionRepo.remove(s.id);
    }

    const tokens: Token[] = [];
    for (const s of subscriptions) {
      const token = await tokenRepo.findById(s.tokenId);
      if (token) tokens.push(token);
    }
    for (const t of tokens) {
      await tokenRepo.remove(t.id);
    }

    jest.clearAllMocks();
  });

  const email = 'test@test.com';
  const city = 'Kyiv';

  it('should create a new subscription', async () => {
    const res = await request(server).post('/subscription/subscribe').send({
      email,
      city,
      frequency: SubscriptionFrequencyEnum.DAILY,
    });

    expect(res.status).toBe(200);
    expect(mockNotificationService.sendConfirmationEmail).toHaveBeenCalled();

    const subs = await subscriptionRepo.find({
      email,
      city,
      frequency: SubscriptionFrequencyEnum.DAILY,
    });
    expect(subs.length).toBe(1);
    expect(subs[0].confirmed).toBe(false);
  });

  it('should not allow duplicate subscriptions', async () => {
    await request(server).post('/subscription/subscribe').send({
      email,
      city,
      frequency: SubscriptionFrequencyEnum.DAILY,
    });

    const res = await request(server).post('/subscription/subscribe').send({
      email,
      city,
      frequency: SubscriptionFrequencyEnum.DAILY,
    });

    expect(res.status).toBe(409);
  });

  it('should validate invalid input', async () => {
    const res = await request(server).post('/subscription/subscribe').send({
      email: 'invalid',
      city: '',
      frequency: 'weekly',
    });

    expect(res.status).toBe(400);
  });

  it('should confirm subscription', async () => {
    await request(server).post('/subscription/subscribe').send({
      email,
      city,
      frequency: SubscriptionFrequencyEnum.DAILY,
    });

    const [sub] = await subscriptionRepo.find({
      email,
      city,
      frequency: SubscriptionFrequencyEnum.DAILY,
    });
    console.log(sub);
    const token = await tokenRepo.findById(sub.tokenId);
    console.log(token);
    if (!token) throw new Error('Token not found');

    const res = await request(server).get(
      `/subscription/confirm/${token.value}`,
    );

    expect(res.status).toBe(200);
    expect(
      mockNotificationService.sendSubscriptionConfirmedEmail,
    ).toHaveBeenCalled();

    const [updated] = await subscriptionRepo.find({ email });
    expect(updated.confirmed).toBe(true);
  });

  it('should unsubscribe successfully', async () => {
    await request(server).post('/subscription/subscribe').send({
      email,
      city,
      frequency: SubscriptionFrequencyEnum.DAILY,
    });

    const [sub] = await subscriptionRepo.find({ email });
    const token = await tokenRepo.findById(sub.tokenId);
    if (!token) throw new Error('Token not found');

    await request(server).get(`/subscription/confirm/${token.value}`);

    const res = await request(server).get(
      `/subscription/unsubscribe/${token.value}`,
    );

    expect(res.status).toBe(200);
    expect(mockNotificationService.sendUnsubscribeSuccess).toHaveBeenCalled();

    const after = await subscriptionRepo.find({ email });
    expect(after.length).toBe(0);
  });

  it('should return 400 for invalid token', async () => {
    const res = await request(server).get(
      `/subscription/unsubscribe/invalid-token`,
    );
    expect(res.status).toBe(400);
  });
});
