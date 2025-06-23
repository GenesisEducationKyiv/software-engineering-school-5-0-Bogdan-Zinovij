/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupTestApp, teardownTestApp } from './setup-test-app';
import { WeatherService } from '../../src/weather/application/weather.service';
import { Weather } from '../../src/weather/domain/weather.model';

describe('WeatherController (Integration)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(WeatherService)
      .useValue({
        getCurrentWeather: jest.fn((city: string) => {
          if (city === 'NotFoundCity') {
            const error = new Error('City not found') as any;
            error.response = { status: HttpStatus.BAD_REQUEST };
            throw error;
          }

          return Promise.resolve(new Weather(22, 60, `Clear sky in ${city}`));
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await setupTestApp(app);
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('GET /weather', () => {
    it('should return weather for valid city', async () => {
      const response = await request(server)
        .get('/weather')
        .query({ city: 'Kyiv' })
        .expect(200);

      expect(response.body).toMatchObject({
        temperature: 22,
        humidity: 60,
        description: 'Clear sky in Kyiv',
      });
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
