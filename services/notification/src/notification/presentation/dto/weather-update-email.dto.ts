import { WeatherData } from './weather-data.type';

export interface WeatherUpdateEmailDto {
  email: string;
  city: string;
  weather: WeatherData;
  token: string;
}
