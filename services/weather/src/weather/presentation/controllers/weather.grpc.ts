import { Controller, HttpStatus } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { WeatherService } from '../../application/weather.service';
import { status } from '@grpc/grpc-js';
import { HTTP_ERROR_MESSAGES } from 'src/common/constants/http.constants';
import { HttpError } from 'src/common/interfaces/http-error.interface';

interface WeatherRequest {
  city: string;
}

interface WeatherResponse {
  temperature: number;
  humidity: number;
  description: string;
}

@Controller()
export class WeatherGrpcController {
  constructor(private readonly weatherService: WeatherService) {}

  @GrpcMethod('WeatherService', 'GetCurrentWeather')
  async getCurrentWeather(request: WeatherRequest): Promise<WeatherResponse> {
    if (!request.city) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: HTTP_ERROR_MESSAGES.WEATHER_INVALID_REQUEST,
      });
    }

    try {
      const weather = await this.weatherService.getCurrentWeather(request.city);
      return {
        temperature: weather.temperature,
        humidity: weather.humidity,
        description: weather.description,
      };
    } catch (err: unknown) {
      const error = err as HttpError;

      if (error.response?.status === HttpStatus.BAD_REQUEST) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: HTTP_ERROR_MESSAGES.WEATHER_CITY_NOT_FOUND,
        });
      }

      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: HTTP_ERROR_MESSAGES.WEATHER_INVALID_REQUEST,
      });
    }
  }
}
