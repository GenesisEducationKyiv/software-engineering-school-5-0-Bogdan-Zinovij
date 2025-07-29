export abstract class MetricsService {
  // HTTP request count by route + status
  abstract incHttpRequests(
    route: string,
    method: string,
    statusCode: number
  ): void;

  // Email sending
  abstract incEmailSent(): void;
  abstract incEmailFailed(): void;

  // Subscription events
  abstract incSubscriptionCreated(): void;
  abstract incSubscriptionConfirmed(): void;
  abstract incSubscriptionCancelled(): void;

  // Weather data cache
  abstract incWeatherCacheHit(): void;
  abstract incWeatherCacheMiss(): void;
}
