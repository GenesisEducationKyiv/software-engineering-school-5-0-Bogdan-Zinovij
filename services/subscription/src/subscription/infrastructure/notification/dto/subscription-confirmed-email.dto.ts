import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { WeatherData } from 'src/common/types/weather-data.type';

export interface SubscriptionConfirmedEmailDto {
  email: string;
  frequency: SubscriptionFrequencyEnum;
  city: string;
  weather: WeatherData;
  token: string;
}
