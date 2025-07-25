export abstract class EventBus {
  abstract publish(topic: string, payload: unknown): void;
}
