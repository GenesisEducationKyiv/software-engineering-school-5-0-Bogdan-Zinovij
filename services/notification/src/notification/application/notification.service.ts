import { Injectable } from '@nestjs/common';
import { MailSender } from 'src/mail/domain/mail-sender';
import { MailTemplates } from 'src/notification/email-templates/mail.templates';
import { SubscriptionEmailLinkHelper } from '../helpers/subscription-email-link.helper';
import { ConfirmationEmailDto } from '../presentation/dto/confirmation-email.dto';
import { SubscriptionConfirmedEmailDto } from '../presentation/dto/subscription-confirmed-email.dto';
import { WeatherUpdateEmailDto } from '../presentation/dto/weather-update-email.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly mailService: MailSender) {}

  async sendConfirmationEmail(data: ConfirmationEmailDto): Promise<void> {
    const confirmLink = SubscriptionEmailLinkHelper.getConfirmLink(data.token);
    await this.mailService.sendMail({
      receiverEmail: data.email,
      subject: MailTemplates.CONFIRM_SUBSCRIPTION.subject,
      html: MailTemplates.CONFIRM_SUBSCRIPTION.html(confirmLink, data.token),
    });
  }

  async sendSubscriptionConfirmedEmail(
    data: SubscriptionConfirmedEmailDto,
  ): Promise<void> {
    const unsubscribeLink = SubscriptionEmailLinkHelper.getUnsubscribeLink(
      data.token,
    );
    await this.mailService.sendMail({
      receiverEmail: data.email,
      subject: MailTemplates.SUBSCRIPTION_CONFIRMED.subject,
      html: MailTemplates.SUBSCRIPTION_CONFIRMED.html(
        data.frequency,
        data.city,
        data.weather,
        unsubscribeLink,
      ),
    });
  }

  async sendUnsubscribeSuccess(email: string): Promise<void> {
    await this.mailService.sendMail({
      receiverEmail: email,
      subject: MailTemplates.UNSUBSCRIBE_SUCCESS.subject,
      html: MailTemplates.UNSUBSCRIBE_SUCCESS.html(),
    });
  }

  async sendWeatherUpdate(data: WeatherUpdateEmailDto): Promise<void> {
    const unsubscribeLink = SubscriptionEmailLinkHelper.getUnsubscribeLink(
      data.token,
    );
    await this.mailService.sendMail({
      receiverEmail: data.email,
      subject: MailTemplates.WEATHER_UPDATE.subject(data.city),
      html: MailTemplates.WEATHER_UPDATE.html(
        data.city,
        data.weather,
        unsubscribeLink,
      ),
    });
  }
}
