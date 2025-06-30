/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupTestApp, teardownTestApp } from './setup-test-app';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('WeatherController (Integration)', () => {
  let app: INestApplication;
  let server: any;
  let cacheManager: Cache;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await setupTestApp(app);
    await app.init();
    server = app.getHttpServer();
    cacheManager = app.get<Cache>(CACHE_MANAGER);
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('GET /weather', () => {
    it('should return weather for valid city (misses cache)', async () => {
      const city = 'Kyiv';
      await cacheManager.del(`weather:${city.toLowerCase()}`);

      const response = await request(server)
        .get('/weather')
        .query({ city })
        .expect(200);

      expect(response.body).toHaveProperty('temperature');
      expect(response.body).toHaveProperty('humidity');
      expect(response.body).toHaveProperty('description');

      const cached = await cacheManager.get(`weather:${city.toLowerCase()}`);
      expect(cached).toBeDefined();
    });

    it('should return weather from cache if available (cache hit)', async () => {
      const city = 'CachedCity';
      const mockData = {
        temperature: 10,
        humidity: 50,
        description: 'Cached weather',
      };
      await cacheManager.set(`weather:${city.toLowerCase()}`, mockData);

      const response = await request(server)
        .get('/weather')
        .query({ city })
        .expect(200);

      expect(response.body).toEqual(mockData);
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
