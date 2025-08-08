import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { WeatherClient } from './weather-client';
import { Weather } from '../domain/weather.model';
import { WeatherData } from '../domain/types/weather-data.type';
import { InMemoryCacheService } from '../../cache/infrastructure/in-memory-cache.service';
import { CacheService } from '../../cache/domain/cache.service';
import { WeatherMetricsService } from 'src/metrics/domain/weather-metrics.service';
import { LoggerPort } from '@libs/logger';

const mockWeatherData: WeatherData = {
  temperature: 20,
  humidity: 60,
  description: 'Sunny',
};

class MockWeatherClient {
  getWeather = jest.fn().mockResolvedValue(mockWeatherData);
}

const mockMetricsService = {
  incWeatherCacheHit: jest.fn(),
  incWeatherCacheMiss: jest.fn(),
};

const mockLogger: jest.Mocked<LoggerPort> = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('WeatherService (unit)', () => {
  let service: WeatherService;
  let client: MockWeatherClient;
  let cache: InMemoryCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: WeatherClient, useClass: MockWeatherClient },
        { provide: CacheService, useClass: InMemoryCacheService },
        { provide: WeatherMetricsService, useValue: mockMetricsService },
        { provide: LoggerPort, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    client = module.get(WeatherClient);
    cache = module.get<CacheService>(CacheService) as InMemoryCacheService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return weather from cache if exists (cache hit)', async () => {
    const city = 'Kyiv';
    const cachedWeather = new Weather(25, 50, 'Cloudy');
    await cache.set(`weather:${city.toLowerCase()}`, cachedWeather, 3600);

    const result = await service.getCurrentWeather(city);

    expect(result).toEqual(cachedWeather);
    expect(client.getWeather).not.toHaveBeenCalled();
    expect(mockMetricsService.incWeatherCacheHit).toHaveBeenCalled();
  });

  it('should fetch weather if not in cache (cache miss)', async () => {
    const city = 'Lviv';
    const result = await service.getCurrentWeather(city);

    expect(result).toEqual(new Weather(20, 60, 'Sunny'));
    expect(client.getWeather).toHaveBeenCalledWith(city);

    const cached = await cache.get(`weather:${city.toLowerCase()}`);
    expect(cached).toEqual(mockWeatherData);
    expect(mockMetricsService.incWeatherCacheMiss).toHaveBeenCalled();
  });
});
