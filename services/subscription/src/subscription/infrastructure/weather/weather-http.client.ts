import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { WeatherData } from '../../../common/types/weather-data.type';

@Injectable()
export class WeatherHttpClientService {
  constructor(
    private readonly http: HttpService,
    @Inject('WEATHER_URL')
    private readonly WEATHER_URL: string,
  ) {}

  async getCurrentWeather(city: string): Promise<WeatherData> {
    const url = `${this.WEATHER_URL}/weather?city=${encodeURIComponent(city)}`;
    const { data } = await this.http.axiosRef.get<WeatherData>(url);
    return data;
  }
}
