import { Inject, Injectable } from '@nestjs/common';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherData } from 'src/weather/domain/types/weather-data.type';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { OpenWeatherMapResponse } from 'src/weather/infrastructure/providers/types/openweathermap-response.type';
import { buildOpenWeatherMapUrl } from '../helpers/weather-url.builder';

@Injectable()
export class OpenWeatherMapProvider implements WeatherProvider {
  constructor(
    private readonly httpService: HttpService,
    @Inject('OPENWEATHER_API_CONFIG')
    private readonly config: { baseUrl: string; apiKey: string },
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const url = buildOpenWeatherMapUrl(
      this.config.baseUrl,
      this.config.apiKey,
      city,
    );

    const response: AxiosResponse<OpenWeatherMapResponse> = await lastValueFrom(
      this.httpService.get<OpenWeatherMapResponse>(url),
    );

    const data = response.data;

    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
    };
  }
}
