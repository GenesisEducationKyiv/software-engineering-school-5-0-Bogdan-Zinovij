/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { WeatherApiProvider } from './weatherapi.provider';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { LoggerPort } from '@libs/logger';

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
  let logger: jest.Mocked<LoggerPort>;
  let provider: WeatherApiProvider;

  beforeEach(() => {
    httpService = { get: jest.fn().mockReturnValue(of(mockResponse)) } as any;
    logger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    provider = new WeatherApiProvider(httpService, config, logger);
  });

  it('should return mapped weather data', async () => {
    const result = await provider.getWeather(city);
    expect(result).toEqual({
      temperature: 22,
      humidity: 50,
      description: 'Clear',
    });

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringMatching(/weatherapi\.com response for Odesa/),
      'WeatherProvider',
    );
  });

  it('should log and throw on error', async () => {
    const error = new Error('API Error');
    httpService.get = jest.fn().mockImplementation(() => {
      throw error;
    }) as any;

    await expect(provider.getWeather(city)).rejects.toThrow();

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringMatching(/weatherapi\.com failed for Odesa/),
      expect.stringMatching(/API Error/),
      'WeatherProvider',
    );
  });
});
