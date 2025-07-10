import { Module } from '@nestjs/common';
import { MailService } from './infrastructure/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppConfigModule } from 'src/config/app-config.module';
import { AppConfigService } from 'src/config/app-config.service';
import { MailSender } from './domain/mail-sender';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) =>
        configService.getMailerConfig(),
    }),
  ],
  providers: [
    {
      provide: MailSender,
      useClass: MailService,
    },
  ],
  exports: [MailSender],
})
export class MailModule {}
