import { Injectable } from '@nestjs/common';
import { WeatherProviderConfig } from 'src/weather/domain/types/weather-provider-config.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}
  getOpenWeatherMapConfig(): WeatherProviderConfig {
    return {
      baseUrl: this.configService.getOrThrow<string>(
        'OPENWEATHER_API_BASE_URL',
      ),
      apiKey: this.configService.getOrThrow<string>('OPENWEATHER_API_KEY'),
    };
  }

  getWeatherApiConfig(): WeatherProviderConfig {
    return {
      baseUrl: this.configService.getOrThrow<string>('WEATHER_API_BASE_URL'),
      apiKey: this.configService.getOrThrow<string>('WEATHER_API_KEY'),
    };
  }
}
