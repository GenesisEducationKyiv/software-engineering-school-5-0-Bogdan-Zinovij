import { WeatherData } from './weather-data.type';

export class WeatherUpdateReadyEvent {
  constructor(
    public email: string,
    public city: string,
    public weather: WeatherData,
    public token: string,
  ) {}
}
