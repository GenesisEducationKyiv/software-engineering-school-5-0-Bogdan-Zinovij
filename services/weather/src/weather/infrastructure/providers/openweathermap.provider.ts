import { Inject, Injectable } from '@nestjs/common';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherData } from 'src/weather/domain/types/weather-data.type';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { OpenWeatherMapResponse } from './types/openweathermap-response.type';
import { buildOpenWeatherMapUrl } from './helpers/weather-url.builder';
import { LoggerPort } from '@libs/logger';

@Injectable()
export class OpenWeatherMapProvider implements WeatherProvider {
  private readonly PROVIDER_NAME = 'openweathermap.org';

  constructor(
    private readonly httpService: HttpService,
    @Inject('OPENWEATHER_API_CONFIG')
    private readonly config: { baseUrl: string; apiKey: string },
    private readonly logger: LoggerPort,
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const url = buildOpenWeatherMapUrl(
      this.config.baseUrl,
      this.config.apiKey,
      city,
    );

    try {
      const response = await lastValueFrom(
        this.httpService.get<OpenWeatherMapResponse>(url),
      );

      // api error imitation
      // throw new Error('Server unavailable');

      this.logger.info(
        `${this.PROVIDER_NAME} response for ${city}: ${JSON.stringify(response.data)}`,
        'WeatherProvider',
      );

      const data = response.data;

      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description,
      };
    } catch (error) {
      this.logger.error(
        `${this.PROVIDER_NAME} failed for ${city}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error?.stack,
        'WeatherProvider',
      );
      throw error;
    }
  }
}
