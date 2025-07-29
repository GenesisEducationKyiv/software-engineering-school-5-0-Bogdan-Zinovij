/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { LoggerPort } from '@libs/logger';
import { MetricsService } from '@libs/metrics';

interface WeatherServiceGrpc {
  getCurrentWeather(request: { city: string }): any;
}

@Controller('weather')
export class WeatherGatewayController {
  private weatherService: WeatherServiceGrpc;
  private readonly context = 'ApiGateway';

  constructor(
    @Inject('WEATHER_PACKAGE') private client: ClientGrpc,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

  onModuleInit() {
    this.weatherService =
      this.client.getService<WeatherServiceGrpc>('WeatherService');
  }

  @Get()
  async getWeather(@Query('city') city: string) {
    this.logger.debug(
      `Received weather request for city: ${city}`,
      this.context,
    );

    if (!city) {
      throw new BadRequestException('City query parameter is required');
    }

    try {
      const response$ = this.weatherService.getCurrentWeather({ city });
      const result = await lastValueFrom(response$);

      this.logger.info(`Weather data fetched for ${city}`, this.context);
      this.metrics.incHttpRequests('/weather', 'GET', 200);

      return result;
    } catch (err: any) {
      this.logger.error(
        `Failed to get weather for ${city}`,
        err?.stack,
        this.context,
      );
      this.metrics.incHttpRequests('/weather', 'GET', err.code ?? 500);

      const code = err.code;
      const message = err.details || 'Unknown error';

      switch (code) {
        case status.INVALID_ARGUMENT:
          throw new BadRequestException(message);
        case status.NOT_FOUND:
          throw new NotFoundException(message);
        default:
          throw new InternalServerErrorException(message);
      }
    }
  }
}
