export interface NotificationEventSubscriber {
  subscribeToAll(): Promise<void>;
}
