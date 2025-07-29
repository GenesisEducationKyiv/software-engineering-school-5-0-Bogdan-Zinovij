import { Injectable } from '@nestjs/common';
import { MailSender } from 'src/mail/domain/mail-sender';
import { MailTemplates } from 'src/notification/email-templates/mail.templates';
import { SubscriptionEmailLinkHelper } from '../helpers/subscription-email-link.helper';
import { ConfirmationEmailDto } from '../presentation/dto/confirmation-email.dto';
import { SubscriptionConfirmedEmailDto } from '../presentation/dto/subscription-confirmed-email.dto';
import { WeatherUpdateEmailDto } from '../presentation/dto/weather-update-email.dto';
import { LoggerPort } from '@libs/logger';
import { MetricsService } from '@libs/metrics';

@Injectable()
export class NotificationService {
  constructor(
    private readonly mailService: MailSender,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

  async sendConfirmationEmail(data: ConfirmationEmailDto): Promise<void> {
    const confirmLink = SubscriptionEmailLinkHelper.getConfirmLink(data.token);

    this.logger.info(
      `Sending confirmation email to ${data.email}`,
      'NotificationService',
    );

    await this.mailService
      .sendMail({
        receiverEmail: data.email,
        subject: MailTemplates.CONFIRM_SUBSCRIPTION.subject,
        html: MailTemplates.CONFIRM_SUBSCRIPTION.html(confirmLink, data.token),
      })
      .then(() => this.metrics.incEmailSent())
      .catch(() => this.metrics.incEmailFailed());
  }

  async sendSubscriptionConfirmedEmail(
    data: SubscriptionConfirmedEmailDto,
  ): Promise<void> {
    const unsubscribeLink = SubscriptionEmailLinkHelper.getUnsubscribeLink(
      data.token,
    );

    this.logger.info(
      `Sending subscription confirmed email to ${data.email} for ${data.city} (${data.frequency})`,
      'NotificationService',
    );

    await this.mailService
      .sendMail({
        receiverEmail: data.email,
        subject: MailTemplates.SUBSCRIPTION_CONFIRMED.subject,
        html: MailTemplates.SUBSCRIPTION_CONFIRMED.html(
          data.frequency,
          data.city,
          data.weather,
          unsubscribeLink,
        ),
      })
      .then(() => this.metrics.incEmailSent())
      .catch(() => this.metrics.incEmailFailed());
  }

  async sendUnsubscribeSuccess(email: string): Promise<void> {
    this.logger.info(
      `Sending unsubscribe success email to ${email}`,
      'NotificationService',
    );

    await this.mailService
      .sendMail({
        receiverEmail: email,
        subject: MailTemplates.UNSUBSCRIBE_SUCCESS.subject,
        html: MailTemplates.UNSUBSCRIBE_SUCCESS.html(),
      })
      .then(() => this.metrics.incEmailSent())
      .catch(() => this.metrics.incEmailFailed());
  }

  async sendWeatherUpdate(data: WeatherUpdateEmailDto): Promise<void> {
    const unsubscribeLink = SubscriptionEmailLinkHelper.getUnsubscribeLink(
      data.token,
    );

    this.logger.info(
      `Sending weather update email to ${data.email} for ${data.city}`,
      'NotificationService',
    );

    await this.mailService
      .sendMail({
        receiverEmail: data.email,
        subject: MailTemplates.WEATHER_UPDATE.subject(data.city),
        html: MailTemplates.WEATHER_UPDATE.html(
          data.city,
          data.weather,
          unsubscribeLink,
        ),
      })
      .then(() => this.metrics.incEmailSent())
      .catch(() => this.metrics.incEmailFailed());
  }
}
