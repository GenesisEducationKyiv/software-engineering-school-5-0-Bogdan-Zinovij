export abstract class SubscriptionMetricsService {
  abstract incSubscriptionCreated(): void;
  abstract incSubscriptionConfirmed(): void;
  abstract incSubscriptionCancelled(): void;
}
