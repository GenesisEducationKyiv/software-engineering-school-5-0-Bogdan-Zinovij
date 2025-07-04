import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailSender } from '../domain/mail-sender';

interface SendMailParams {
  receiverEmail: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService extends MailSender {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async sendMail({
    receiverEmail,
    subject,
    html,
  }: SendMailParams): Promise<void> {
    await this.mailerService.sendMail({ to: receiverEmail, subject, html });
  }
}
