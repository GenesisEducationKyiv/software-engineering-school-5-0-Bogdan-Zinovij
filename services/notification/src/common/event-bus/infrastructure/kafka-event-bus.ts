import { Injectable } from '@nestjs/common';
import { Consumer, Kafka, EachMessagePayload } from 'kafkajs';
import { EventBus } from '../domain/event-bus.abstract';

type Handler<T = any> = (payload: T) => Promise<void> | void;

@Injectable()
export class KafkaEventBus implements EventBus {
  private readonly kafka = new Kafka({
    clientId: 'notification',
    brokers: ['kafka:9092'],
  });

  private readonly consumer: Consumer = this.kafka.consumer({
    groupId: 'notification-consumer',
  });

  private readonly handlers: { topic: string; handler: Handler }[] = [];
  private isRunning = false;

  async connect(): Promise<void> {
    await this.consumer.connect();
  }

  subscribe<T>(topic: string, handler: Handler<T>): void {
    if (this.isRunning) {
      throw new Error('Cannot subscribe after consumer is running');
    }

    this.handlers.push({ topic, handler });
  }

  async start(): Promise<void> {
    for (const { topic } of this.handlers) {
      await this.consumer.subscribe({ topic });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        const found = this.handlers.find((h) => h.topic === topic);
        if (found) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const data = JSON.parse(message.value!.toString());
          await found.handler(data);
        }
      },
    });

    this.isRunning = true;
  }
}
