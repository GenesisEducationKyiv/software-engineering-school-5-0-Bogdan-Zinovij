import { WeatherData } from "./weather-data.type";

enum SubscriptionFrequencyEnum {
  HOURLY = "hourly",
  DAILY = "daily",
}

export class SubscriptionConfirmedEvent {
  constructor(
    public email: string,
    public frequency: SubscriptionFrequencyEnum,
    public city: string,
    public weather: WeatherData,
    public token: string
  ) {}
}
