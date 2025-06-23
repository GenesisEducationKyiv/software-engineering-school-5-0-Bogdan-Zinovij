import { Weather } from 'src/weather/domain/weather.model';

export interface WeatherUpdateEmailDto {
  email: string;
  city: string;
  weather: Weather;
  token: string;
}
