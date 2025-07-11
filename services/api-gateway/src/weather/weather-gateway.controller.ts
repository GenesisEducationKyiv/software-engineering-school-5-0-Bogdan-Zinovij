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

interface WeatherServiceGrpc {
  getCurrentWeather(request: { city: string }): any;
}

@Controller('weather')
export class WeatherGatewayController {
  private weatherService: WeatherServiceGrpc;

  constructor(@Inject('WEATHER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.weatherService =
      this.client.getService<WeatherServiceGrpc>('WeatherService');
  }

  @Get()
  async getWeather(@Query('city') city: string) {
    if (!city) {
      throw new BadRequestException('City query parameter is required');
    }

    try {
      const response$ = this.weatherService.getCurrentWeather({ city });
      return await lastValueFrom(response$);
    } catch (err: any) {
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
