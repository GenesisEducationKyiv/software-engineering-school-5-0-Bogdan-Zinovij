export abstract class EventBus {
  abstract subscribe<T>(
    topic: string,
    handler: (payload: T) => Promise<void>,
  ): void;
}
