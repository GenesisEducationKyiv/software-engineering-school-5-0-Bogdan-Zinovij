/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { OpenWeatherMapProvider } from './openweathermap.provider';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WeatherLogger } from '../logger/weather.logger';

describe('OpenWeatherMapProvider', () => {
  const config = {
    baseUrl: 'http://api.openweathermap.org',
    apiKey: 'test-key',
  };
  const city = 'Dnipro';

  const mockResponse = {
    data: {
      main: {
        temp: 30,
        humidity: 40,
      },
      weather: [
        {
          description: 'Hot',
        },
      ],
    },
  } as AxiosResponse;

  let httpService: HttpService;
  let logger: WeatherLogger;
  let provider: OpenWeatherMapProvider;

  beforeEach(() => {
    httpService = { get: jest.fn().mockReturnValue(of(mockResponse)) } as any;
    logger = { log: jest.fn() } as any;
    provider = new OpenWeatherMapProvider(httpService, config, logger);
  });

  it('should return mapped weather data', async () => {
    const result = await provider.getWeather(city);
    expect(result).toEqual({
      temperature: 30,
      humidity: 40,
      description: 'Hot',
    });

    expect(logger.log).toHaveBeenCalledWith(
      'openweathermap.org',
      expect.stringMatching(/Response/),
    );
  });

  it('should log and throw on error', async () => {
    const error = new Error('API Error');
    httpService.get = jest.fn().mockReturnValue(throwError(() => error)) as any;

    await expect(provider.getWeather(city)).rejects.toThrow('API Error');

    expect(logger.log).toHaveBeenCalledWith(
      'openweathermap.org',
      expect.stringMatching(/Error/),
    );
  });
});
