import { Inject, Injectable } from '@nestjs/common';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherData } from 'src/weather/domain/types/weather-data.type';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { WeatherApiResponse } from 'src/weather/infrastructure/providers/types/weatherapi-response.type';
import { buildWeatherApiUrl } from '../helpers/weather-url.builder';

@Injectable()
export class WeatherApiProvider implements WeatherProvider {
  constructor(
    private readonly httpService: HttpService,
    @Inject('WEATHER_API_CONFIG')
    private readonly config: { baseUrl: string; apiKey: string },
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const url = buildWeatherApiUrl(
      this.config.baseUrl,
      this.config.apiKey,
      city,
    );

    const response: AxiosResponse<WeatherApiResponse> = await lastValueFrom(
      this.httpService.get<WeatherApiResponse>(url),
    );

    const data = response.data;

    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      description: data.current.condition.text,
    };
  }
}
