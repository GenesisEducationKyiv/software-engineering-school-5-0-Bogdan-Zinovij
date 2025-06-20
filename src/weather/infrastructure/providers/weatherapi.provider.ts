import { Injectable } from '@nestjs/common';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherData } from 'src/weather/domain/types/weather-data.type';
import { HttpService } from '@nestjs/axios';
import { AppConfigService } from 'src/config/app-config.service';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { WeatherApiResponse } from '../../../common/interfaces/weatherapi-response.interface';

@Injectable()
export class WeatherApiProvider implements WeatherProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
  ) {
    const { baseUrl, apiKey } = this.appConfigService.getWeatherApiConfig();
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getWeather(city: string): Promise<WeatherData> {
    const url = `${this.baseUrl}?key=${this.apiKey}&q=${encodeURIComponent(city)}&aqi=no`;

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
