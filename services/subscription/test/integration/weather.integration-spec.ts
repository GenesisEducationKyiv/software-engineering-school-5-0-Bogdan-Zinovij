/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupTestApp, teardownTestApp } from './setup-test-app';
import { WeatherClient } from '../../src/weather/application/weather-client';
import { CacheService } from '../../src/common/cache/cache.service';
import { MailSender } from 'src/mail/domain/mail-sender';

describe('WeatherController (Integration with mocked WeatherClient)', () => {
  let app: INestApplication;
  let server: any;
  let cache: CacheService;

  const mockWeatherClient = {
    getWeather: jest.fn((city: string) => {
      if (city === 'NotFoundCity') {
        const error = new Error('City not found') as any;
        error.response = { status: HttpStatus.BAD_REQUEST };
        throw error;
      }

      return Promise.resolve({
        temperature: 22,
        humidity: 60,
        description: `Clear sky in ${city}`,
      });
    }),
  };

  const mockMailSender = {
    sendMail: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(WeatherClient)
      .useValue(mockWeatherClient)
      .overrideProvider(MailSender)
      .useValue(mockMailSender)
      .compile();

    app = moduleFixture.createNestApplication();
    await setupTestApp(app);
    await app.init();

    server = app.getHttpServer();
    cache = app.get<CacheService>(CacheService);
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('GET /weather', () => {
    const city = 'Kyiv';
    const cacheKey = `weather:${city.toLowerCase()}`;

    it('should return weather on cache miss and then populate cache', async () => {
      await cache.set(cacheKey, null, 1);

      const response = await request(server)
        .get('/weather')
        .query({ city })
        .expect(200);

      expect(response.body).toMatchObject({
        temperature: 22,
        humidity: 60,
        description: `Clear sky in ${city}`,
      });

      const cached = await cache.get(cacheKey);
      expect(cached).toMatchObject({
        temperature: 22,
        humidity: 60,
        description: `Clear sky in ${city}`,
      });

      expect(mockWeatherClient.getWeather).toHaveBeenCalledWith(city);
    });

    it('should return weather from cache (cache hit)', async () => {
      const response = await request(server)
        .get('/weather')
        .query({ city })
        .expect(200);

      expect(response.body).toMatchObject({
        temperature: 22,
        humidity: 60,
        description: `Clear sky in ${city}`,
      });

      expect(mockWeatherClient.getWeather).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for missing city query param', async () => {
      const response = await request(server).get('/weather').expect(400);
      expect(response.body.message).toBe('Invalid request');
    });

    it('should return 404 for city not found', async () => {
      const response = await request(server)
        .get('/weather')
        .query({ city: 'NotFoundCity' })
        .expect(404);

      expect(response.body.message).toBe('City not found');
    });
  });
});
