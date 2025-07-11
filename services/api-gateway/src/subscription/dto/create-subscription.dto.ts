import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

enum SubscriptionFrequencyEnum {
  HOURLY = 'hourly',
  DAILY = 'daily',
}

export class CreateSubscriptionDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  city: string;

  @IsEnum(SubscriptionFrequencyEnum)
  frequency: SubscriptionFrequencyEnum;
}
