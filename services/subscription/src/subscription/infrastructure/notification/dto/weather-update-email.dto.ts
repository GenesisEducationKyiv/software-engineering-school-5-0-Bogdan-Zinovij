import { WeatherData } from 'src/common/types/weather-data.type';

export interface WeatherUpdateEmailDto {
  email: string;
  city: string;
  weather: WeatherData;
  token: string;
}
