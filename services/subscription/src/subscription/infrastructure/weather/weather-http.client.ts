import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { WeatherData } from '../../../common/types/weather-data.type';

@Injectable()
export class WeatherHttpClientService {
  constructor(private readonly http: HttpService) {}

  async getCurrentWeather(city: string): Promise<WeatherData> {
    const url = `http://weather:3002/weather?city=${encodeURIComponent(city)}`;
    const { data } = await this.http.axiosRef.get<WeatherData>(url);
    return data;
  }
}
