import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { WeatherProviderConfig } from 'src/weather/domain/types/weather-provider-config.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  getPostgresConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('POSTGRES_HOST'),
      port: parseInt(
        this.configService.getOrThrow<string>('POSTGRES_PORT'),
        10,
      ),
      username: this.configService.get<string>('POSTGRES_USER'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DB'),
      autoLoadEntities: true,
      synchronize: false,
      migrationsRun: true,
      migrations: ['dist/database/migrations/*.js'],
      logging: ['query', 'error', 'schema', 'warn'],
    };
  }

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
