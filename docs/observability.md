# Logging and Alerting Policy

## 1. Alerting Strategy

The system uses centralized structured logging with `LokiLogger` and Winston. Logs are enriched with contextual tags (`NotificationService`, `ApiGateway`, `WeatherProvider`...) and categorized by levels: `info`, `debug`, `error`.

### Log-based Alerts

- **High error rate on external weather providers**

  - Trigger when logs from `WeatherProvider` include more than X errors in Y minutes. Helps detect degraded 3rd-party API availability early.

- **Repeated cache misses for the same city**

  - Trigger when many `Cache MISS` logs are seen for the same city within a short period. Indicates caching isn't working or TTL is too short.

- **Spike in subscription errors**

  - Trigger when `SubscriptionService.subscribe failed` occurs N+ times in M minutes. Helps detect database or validation issues quickly.

- **Unsubscribe failure bursts**

  - Detect repeated `unsubscribe` failures via `SubscriptionService.unsubscribe failed`. Ensures user control and compliance isn't broken.

- **Confirmations not followed by events**
  - Check for `confirm succeeded` without a following `subscription-confirmed` event log (future: via metrics). Helps spot broken event chain.

## 2. Log Retention Policy

### Retention duration

| Log Level | Retention Duration | Reasoning                                                          |
| --------- | ------------------ | ------------------------------------------------------------------ |
| `error`   | 90 days            | Audits, incident root cause analysis                               |
| `info`    | 30 days            | Useful for normal operational visibility and usage patterns.       |
| `debug`   | 7 days             | Used only during short-term debugging and tracing specific issues. |

### Rotation and Storage

- Logs are streamed to **Grafana Loki**.
- Rotation is handled automatically by Loki with retention configured per log stream via labels `job`, `context`.
- Archiving to cold storage can be added for `error` logs beyond 90 days, though not required now.

### Deletion Policy

- Logs are not manually deleted.
- Expiration is enforced at the backend level at Loki config.

## 3. Metrics-based Alerting

The service exposes core Prometheus metrics via `libs/metrics`:

- `http_requests_total` (labels: route, method, statusCode)  
  Track API traffic and error rates per route.  
  **Alert:** Trigger if 5xx responses exceed threshold for a specific route within N minutes.

- `email_sent_total` / `email_failed_total`  
  Monitor success/failure ratio of outbound emails.  
  **Alert:** Trigger if `email_failed_total` increases rapidly or failure rate > 5%.

- `subscriptions_created_total` / `subscriptions_confirmed_total` / `subscriptions_cancelled_total`  
  Monitor subscription lifecycle.  
  **Alert:**

  - Sudden drop in `subscriptions_confirmed_total` with stable `subscriptions_created_total` => possible confirmation flow issue.
  - Sudden spike in `subscriptions_cancelled_total` => potential quality issue.

- `weather_cache_hit_total` / `weather_cache_miss_total`  
  Monitor cache effectiveness for weather data.  
  **Alert:** High `miss` ratio indicates degraded cache or TTL misconfiguration.

Retention of metrics is handled by Prometheus
