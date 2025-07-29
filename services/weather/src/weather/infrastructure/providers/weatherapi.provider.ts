import { Inject, Injectable } from '@nestjs/common';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherData } from 'src/weather/domain/types/weather-data.type';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { WeatherApiResponse } from './types/weatherapi-response.type';
import { buildWeatherApiUrl } from './helpers/weather-url.builder';
import { LoggerPort } from '@libs/logger';

@Injectable()
export class WeatherApiProvider implements WeatherProvider {
  private readonly PROVIDER_NAME = 'weatherapi.com';

  constructor(
    private readonly httpService: HttpService,
    @Inject('WEATHER_API_CONFIG')
    private readonly config: { baseUrl: string; apiKey: string },
    private readonly logger: LoggerPort,
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const url = buildWeatherApiUrl(
      this.config.baseUrl,
      this.config.apiKey,
      city,
    );

    try {
      const response = await lastValueFrom(
        this.httpService.get<WeatherApiResponse>(url),
      );

      this.logger.info(
        `WeatherAPI response for ${city}: ${JSON.stringify(response.data)}`,
        'WeatherProvider',
      );

      const data = response.data;

      return {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        description: data.current.condition.text,
      };
    } catch (error) {
      this.logger.error(
        `WeatherAPI failed for ${city}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error?.stack,
        'WeatherProvider',
      );
      throw error;
    }
  }
}
