import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { WeatherClient } from './weather-client';
import { Weather } from '../domain/weather.model';
import { WeatherData } from '../domain/types/weather-data.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MetricsService } from 'src/monitoring/metrics.service';

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

describe('WeatherService', () => {
  let service: WeatherService;
  let client: MockWeatherClient;
  let cacheManager: Cache;

  beforeEach(async () => {
    const cacheStore = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: WeatherClient, useClass: MockWeatherClient },
        { provide: CACHE_MANAGER, useValue: cacheStore },
        { provide: MetricsService, useValue: mockMetricsService },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    client = module.get(WeatherClient);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return weather from cache if exists (cache hit)', async () => {
    const city = 'Kyiv';
    const cachedWeather = new Weather(25, 50, 'Cloudy');
    (cacheManager.get as jest.Mock).mockResolvedValue(cachedWeather);

    const result = await service.getCurrentWeather(city);

    expect(result).toEqual(cachedWeather);
    expect(client.getWeather).not.toHaveBeenCalled();
    expect(mockMetricsService.incWeatherCacheHit).toHaveBeenCalled();
  });

  it('should fetch weather if not in cache (cache miss)', async () => {
    const city = 'Lviv';
    (cacheManager.get as jest.Mock).mockResolvedValue(undefined);

    const result = await service.getCurrentWeather(city);

    expect(result).toEqual(new Weather(20, 60, 'Sunny'));
    expect(client.getWeather).toHaveBeenCalledWith(city);
    expect(cacheManager.set).toHaveBeenCalledWith(
      `weather:${city.toLowerCase()}`,
      mockWeatherData,
    );
    expect(mockMetricsService.incWeatherCacheMiss).toHaveBeenCalled();
  });
});
