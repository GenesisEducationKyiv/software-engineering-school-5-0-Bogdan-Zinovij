import { Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/application/mail.service';
import { MailTemplates } from 'src/mail/constants/mail.templates';
import { Weather } from 'src/weather/domain/weather.model';
import { SubscriptionEmailLinkHelper } from './subscription-email-link.helper';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

@Injectable()
export class SubscriptionNotificationService {
  constructor(private readonly mailService: MailService) {}

  async sendConfirmationEmail(
    email: string,
    token: string,
    domain: string,
    port: string,
  ): Promise<void> {
    const confirmLink = SubscriptionEmailLinkHelper.getConfirmLink(
      domain,
      port,
      token,
    );

    await this.mailService.sendMail({
      receiverEmail: email,
      subject: MailTemplates.CONFIRM_SUBSCRIPTION.subject,
      html: MailTemplates.CONFIRM_SUBSCRIPTION.html(confirmLink, token),
    });
  }

  async sendUnsubscribeSuccess(email: string): Promise<void> {
    await this.mailService.sendMail({
      receiverEmail: email,
      subject: MailTemplates.UNSUBSCRIBE_SUCCESS.subject,
      html: MailTemplates.UNSUBSCRIBE_SUCCESS.html(),
    });
  }

  async sendSubscriptionConfirmedEmail(
    email: string,
    frequency: SubscriptionFrequencyEnum,
    city: string,
    weather: Weather,
    token: string,
    domain: string,
    port: string,
  ): Promise<void> {
    const unsubscribeLink = SubscriptionEmailLinkHelper.getUnsubscribeLink(
      domain,
      port,
      token,
    );

    await this.mailService.sendMail({
      receiverEmail: email,
      subject: MailTemplates.SUBSCRIPTION_CONFIRMED.subject,
      html: MailTemplates.SUBSCRIPTION_CONFIRMED.html(
        frequency,
        city,
        weather,
        unsubscribeLink,
      ),
    });
  }

  async sendWeatherUpdate(
    email: string,
    city: string,
    weather: Weather,
    token: string,
    domain: string,
    port: string,
  ): Promise<void> {
    const unsubscribeLink = SubscriptionEmailLinkHelper.getUnsubscribeLink(
      domain,
      port,
      token,
    );

    await this.mailService.sendMail({
      receiverEmail: email,
      subject: MailTemplates.WEATHER_UPDATE.subject(city),
      html: MailTemplates.WEATHER_UPDATE.html(city, weather, unsubscribeLink),
    });
  }
}
