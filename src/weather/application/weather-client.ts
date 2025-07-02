import { Injectable } from '@nestjs/common';
import { WeatherProvider } from '../domain/interfaces/weather-provider.interface';
import { WeatherData } from '../domain/types/weather-data.type';
import { WeatherProviderChain } from './weather-provider-chain';

@Injectable()
export class WeatherClient {
  private readonly chain: WeatherProviderChain;

  constructor(providers: WeatherProvider[]) {
    this.chain = new WeatherProviderChain(providers);
  }

  getWeather(city: string): Promise<WeatherData> {
    return this.chain.getWeather(city);
  }
}
