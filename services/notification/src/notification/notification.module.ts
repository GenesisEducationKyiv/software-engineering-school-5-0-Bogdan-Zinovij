import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { NotificationService } from './application/subscription-notification.service';
import { NotificationController } from './presentation/controllers/notification.controller';

@Module({
  imports: [MailModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
