/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { WeatherApiProvider } from './weatherapi.provider';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WeatherLogger } from '../logger/weather.logger';

describe('WeatherApiProvider', () => {
  const config = { baseUrl: 'http://api.weatherapi.com', apiKey: 'test-key' };
  const city = 'Odesa';

  const mockResponse = {
    data: {
      current: {
        temp_c: 22,
        humidity: 50,
        condition: {
          text: 'Clear',
        },
      },
    },
  } as AxiosResponse;

  let httpService: HttpService;
  let logger: WeatherLogger;
  let provider: WeatherApiProvider;

  beforeEach(() => {
    httpService = { get: jest.fn().mockReturnValue(of(mockResponse)) } as any;
    logger = { log: jest.fn() } as any;
    provider = new WeatherApiProvider(httpService, config, logger);
  });

  it('should return mapped weather data', async () => {
    const result = await provider.getWeather(city);
    expect(result).toEqual({
      temperature: 22,
      humidity: 50,
      description: 'Clear',
    });

    expect(logger.log).toHaveBeenCalledWith(
      'weatherapi.com',
      expect.stringMatching(/Response/),
    );
  });

  it('should log and throw on error', async () => {
    httpService.get = jest.fn().mockReturnValueOnce({
      toPromise: () => Promise.reject(new Error('API Error')),
    }) as any;

    const erroringProvider = new WeatherApiProvider(
      httpService,
      config,
      logger,
    );
    await expect(erroringProvider.getWeather(city)).rejects.toThrow();

    expect(logger.log).toHaveBeenCalledWith(
      'weatherapi.com',
      expect.stringMatching(/Error/),
    );
  });
});
