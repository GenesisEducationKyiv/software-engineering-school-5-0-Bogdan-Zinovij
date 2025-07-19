import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { NotificationService } from './application/notification.service';
import { NotificationKafkaConsumer } from './presentation/kafka/kafka.consumer';

@Module({
  imports: [MailModule],
  controllers: [NotificationKafkaConsumer],
  providers: [NotificationService],
})
export class NotificationModule {}
