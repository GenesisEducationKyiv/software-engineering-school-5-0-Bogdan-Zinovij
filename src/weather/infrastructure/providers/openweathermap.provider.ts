import { Inject, Injectable } from '@nestjs/common';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherData } from 'src/weather/domain/types/weather-data.type';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { OpenWeatherMapResponse } from './types/openweathermap-response.type';
import { buildOpenWeatherMapUrl } from '../helpers/weather-url.builder';
import { WeatherLogger } from '../logger/weather.logger';

@Injectable()
export class OpenWeatherMapProvider implements WeatherProvider {
  private readonly PROVIDER_NAME = 'openweathermap.org';

  constructor(
    private readonly httpService: HttpService,
    @Inject('OPENWEATHER_API_CONFIG')
    private readonly config: { baseUrl: string; apiKey: string },
    private readonly logger: WeatherLogger,
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const url = buildOpenWeatherMapUrl(
      this.config.baseUrl,
      this.config.apiKey,
      city,
    );

    try {
      const response: AxiosResponse<OpenWeatherMapResponse> =
        await lastValueFrom(this.httpService.get<OpenWeatherMapResponse>(url));

      // api error imitation
      // throw new Error('Server unavailable');

      this.logger.log(
        this.PROVIDER_NAME,
        `Response: ${JSON.stringify(response.data)}`,
      );

      const data = response.data;

      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description,
      };
    } catch (error) {
      this.logger.log(
        this.PROVIDER_NAME,
        `Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`,
      );
      throw error;
    }
  }
}
