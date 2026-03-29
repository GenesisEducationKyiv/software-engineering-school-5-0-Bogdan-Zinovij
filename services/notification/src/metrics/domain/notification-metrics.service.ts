export abstract class NotificationMetricsService {
  abstract incEmailSent(): void;
  abstract incEmailFailed(): void;
}
