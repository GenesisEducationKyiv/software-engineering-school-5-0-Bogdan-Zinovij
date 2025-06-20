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
