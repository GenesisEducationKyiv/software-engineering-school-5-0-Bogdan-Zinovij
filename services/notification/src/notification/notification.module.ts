import { Module, OnModuleInit } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { NotificationService } from './application/notification.service';
import { EventBus } from 'src/common/event-bus/domain/event-bus.abstract';
import { KafkaEventBus } from 'src/common/event-bus/infrastructure/kafka-event-bus';
import { NotificationEventSubscriberImpl } from './application/event-subscriber/notification-event-subscriber.impl';
import { LoggerModule } from '@libs/logger';

@Module({
  imports: [MailModule, LoggerModule],
  providers: [
    NotificationService,
    KafkaEventBus,
    {
      provide: EventBus,
      useExisting: KafkaEventBus,
    },
    NotificationEventSubscriberImpl,
  ],
})
export class NotificationModule implements OnModuleInit {
  constructor(
    private readonly subscriber: NotificationEventSubscriberImpl,
    private readonly eventBus: KafkaEventBus,
  ) {}

  async onModuleInit() {
    await this.eventBus.connect();
    await this.subscriber.subscribeToAll();
    await this.eventBus.start();
  }
}
