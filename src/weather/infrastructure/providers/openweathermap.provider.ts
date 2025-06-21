import { Inject, Injectable } from '@nestjs/common';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherData } from 'src/weather/domain/types/weather-data.type';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { OpenWeatherMapResponse } from 'src/weather/infrastructure/providers/types/openweathermap-response.type';

@Injectable()
export class OpenWeatherMapProvider implements WeatherProvider {
  constructor(
    private readonly httpService: HttpService,
    @Inject('OPENWEATHER_API_CONFIG')
    private readonly config: { baseUrl: string; apiKey: string },
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const url = `${this.config.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.config.apiKey}&units=metric`;

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
