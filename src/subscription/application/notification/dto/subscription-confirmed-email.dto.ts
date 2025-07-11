import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { Weather } from 'src/weather/domain/weather.model';

export interface SubscriptionConfirmedEmailDto {
  frequency: SubscriptionFrequencyEnum;
  city: string;
  weather: Weather;
  token: string;
}
