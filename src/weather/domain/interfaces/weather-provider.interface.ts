import { WeatherData } from '../types/weather-data.type';

export interface WeatherProvider {
  getWeather(city: string): Promise<WeatherData>;
}
