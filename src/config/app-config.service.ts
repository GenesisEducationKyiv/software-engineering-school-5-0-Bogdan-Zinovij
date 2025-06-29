import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MailerOptions } from '@nestjs-modules/mailer';
import { WeatherProviderConfig } from 'src/weather/domain/types/weather-provider-config.type';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModuleOptions } from '@nestjs/cache-manager';

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

  getRedisConfig(): CacheModuleOptions {
    return {
      store: redisStore,
      host: this.configService.getOrThrow<string>('REDIS_HOST'),
      port: parseInt(this.configService.getOrThrow<string>('REDIS_PORT'), 10),
      ttl: parseInt(this.configService.getOrThrow<string>('REDIS_TTL'), 10),
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

  getMailerConfig(): MailerOptions {
    return {
      transport: {
        host: this.configService.get<string>('SMTP_HOST'),
        port: parseInt(this.configService.getOrThrow<string>('SMTP_PORT'), 10),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      },
      defaults: {
        from: `"${this.configService.get<string>('SMTP_SENDER_NAME') ?? 'NoReply'}" <${this.configService.get<string>('SMTP_SENDER_EMAIL')}>`,
      },
    };
  }
}
