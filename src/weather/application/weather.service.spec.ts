import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { WeatherClient } from './weather-client';
import { Weather } from '../domain/weather.model';
import { WeatherData } from '../domain/types/weather-data.type';

const mockWeatherData: WeatherData = {
  temperature: 20,
  humidity: 60,
  description: 'Sunny',
};

class MockWeatherClient {
  getWeather = jest.fn().mockResolvedValue(mockWeatherData);
}

describe('WeatherService', () => {
  let service: WeatherService;
  let client: MockWeatherClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: WeatherClient, useClass: MockWeatherClient },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    client = module.get<WeatherClient>(
      WeatherClient,
    ) as unknown as MockWeatherClient;
  });

  it('should return current weather for a city', async () => {
    const city = 'Kyiv';
    const result = await service.getCurrentWeather(city);

    expect(result).toEqual(new Weather(20, 60, 'Sunny'));
    expect(client.getWeather).toHaveBeenCalledWith(city);
  });
});
