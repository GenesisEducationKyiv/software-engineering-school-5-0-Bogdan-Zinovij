import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { EventBus } from '../domain/event-bus.interface';

@Injectable()
export class KafkaEventBus implements EventBus, OnModuleInit {
  constructor(
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  publish(topic: string, payload: unknown): void {
    this.kafkaClient.emit(topic, {
      value: JSON.stringify(payload),
    });
  }
}
