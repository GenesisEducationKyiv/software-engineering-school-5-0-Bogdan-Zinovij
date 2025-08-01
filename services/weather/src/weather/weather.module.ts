import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WeatherService } from './application/weather.service';
import { AppConfigService } from 'src/config/app-config.service';
import { WeatherClient } from './application/weather-client';
import { WeatherProvider } from './domain/interfaces/weather-provider.interface';
import { WeatherApiProvider } from './infrastructure/providers/weatherapi.provider';
import { OpenWeatherMapProvider } from './infrastructure/providers/openweathermap.provider';
import { WeatherProviderConfig } from './domain/types/weather-provider-config.type';
import { WeatherLogger } from './infrastructure/logger/weather.logger';
import { CacheModule } from 'src/cache/cache.module';
import { WeatherGrpcController } from './presentation/controllers/weather.grpc';
import { LoggerModule } from '@libs/logger';
import { WeatherMetricsModule } from 'src/metrics/weather-metrics.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    CacheModule,
    LoggerModule,
    WeatherMetricsModule,
  ],
  controllers: [WeatherGrpcController],
  providers: [
    WeatherService,
    AppConfigService,
    WeatherApiProvider,
    OpenWeatherMapProvider,
    WeatherLogger,

    // Weather providers configs
    {
      provide: 'WEATHER_API_CONFIG',
      useFactory: (config: AppConfigService): WeatherProviderConfig =>
        config.getWeatherApiConfig(),
      inject: [AppConfigService],
    },

    {
      provide: 'OPENWEATHER_API_CONFIG',
      useFactory: (config: AppConfigService): WeatherProviderConfig =>
        config.getOpenWeatherMapConfig(),
      inject: [AppConfigService],
    },

    // WEATHER_PROVIDERS
    {
      provide: 'WEATHER_PROVIDERS',
      useFactory: (
        openWeather: OpenWeatherMapProvider,
        weatherApi: WeatherApiProvider,
      ) => [openWeather, weatherApi],
      inject: [OpenWeatherMapProvider, WeatherApiProvider],
    },

    // WeatherClient
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
