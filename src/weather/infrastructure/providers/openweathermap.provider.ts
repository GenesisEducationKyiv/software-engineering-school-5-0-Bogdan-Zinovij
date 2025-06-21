import { Injectable } from '@nestjs/common';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherData } from 'src/weather/domain/types/weather-data.type';
import { HttpService } from '@nestjs/axios';
import { AppConfigService } from 'src/config/app-config.service';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

interface OpenWeatherMapResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
  }[];
}

@Injectable()
export class OpenWeatherMapProvider implements WeatherProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
  ) {
    const { baseUrl, apiKey } = this.appConfigService.getOpenWeatherMapConfig();
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getWeather(city: string): Promise<WeatherData> {
    const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

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
