import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WeatherController } from './interfaces/controllers/weather.controller';
import { WeatherService } from './application/weather.service';
import { AppConfigService } from 'src/config/app-config.service';
import { WeatherClient } from './application/weather-client';
import { WeatherProvider } from './domain/interfaces/weather-provider.interface';
import { WeatherApiProvider } from './infrastructure/providers/weatherapi.provider';
import { OpenWeatherMapProvider } from './infrastructure/providers/openweathermap.provider';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    AppConfigService,
    WeatherClient,
    WeatherApiProvider,
    OpenWeatherMapProvider,
    {
      provide: 'WEATHER_API_CONFIG',
      useFactory: () => {
        const baseUrl = process.env.WEATHER_API_BASE_URL;
        const apiKey = process.env.WEATHER_API_KEY;
        if (!baseUrl || !apiKey) {
          throw new Error('Missing WEATHER_API_BASE_URL or WEATHER_API_KEY');
        }
        return { baseUrl, apiKey };
      },
    },

    {
      provide: 'OPENWEATHER_API_CONFIG',
      useFactory: () => {
        const baseUrl = process.env.OPENWEATHER_API_BASE_URL;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!baseUrl || !apiKey) {
          throw new Error(
            'Missing OPENWEATHER_API_BASE_URL or OPENWEATHER_API_KEY',
          );
        }
        return { baseUrl, apiKey };
      },
    },
    {
      provide: 'WEATHER_PROVIDERS',
      useFactory: (
        openWeather: OpenWeatherMapProvider,
        weatherApi: WeatherApiProvider,
      ) => [openWeather, weatherApi],
      inject: [OpenWeatherMapProvider, WeatherApiProvider],
    },
    {
      provide: WeatherClient,
      useFactory: (providers: WeatherProvider[]) =>
        new WeatherClient(providers),
      inject: ['WEATHER_PROVIDERS'],
    },
  ],
  exports: [WeatherService],
})
export class WeatherModule {}
