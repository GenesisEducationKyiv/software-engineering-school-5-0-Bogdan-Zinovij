import { Injectable } from '@nestjs/common';
import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  getMailerConfig(): MailerOptions {
    return {
      transport: {
        host: this.configService.get<string>('SMTP_HOST'),
        port: parseInt(this.configService.getOrThrow<string>('SMTP_PORT'), 10),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      },
      defaults: {
        from: `"${this.configService.get<string>('SMTP_SENDER_NAME') ?? 'NoReply'}" <${this.configService.get<string>('SMTP_SENDER_EMAIL')}>`,
      },
    };
  }
}
