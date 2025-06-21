import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { WeatherClient } from './weather-client';
import { Weather } from '../domain/weather.model';
import { WeatherData } from '../domain/types/weather-data.type';

describe('WeatherService', () => {
  let service: WeatherService;
  let client: WeatherClient;

  const mockWeatherData: WeatherData = {
    temperature: 20,
    humidity: 60,
    description: 'Sunny',
  };

  const mockWeatherClient = {
    getWeather: jest.fn().mockResolvedValue(mockWeatherData),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: WeatherClient, useValue: mockWeatherClient },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    client = module.get<WeatherClient>(WeatherClient);
  });

  it('should return current weather for a city', async () => {
    const city = 'Kyiv';
    const result = await service.getCurrentWeather(city);

    expect(result).toEqual(new Weather(20, 60, 'Sunny'));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(client.getWeather).toHaveBeenCalledWith(city);
  });
});
