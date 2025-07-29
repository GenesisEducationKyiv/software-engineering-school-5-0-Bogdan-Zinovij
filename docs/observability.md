# Logging and Alerting Policy

## 1. Alerting Strategy

The system uses centralized structured logging with `LokiLogger` and Winston. Logs are enriched with contextual tags (`NotificationService`, `ApiGateway`, `WeatherProvider`...) and categorized by levels: `info`, `debug`, `error`.

### Alerts

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

### TODO

Metrics-based alerts will be added once Prometheus metrics are exposed across all services.

---

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
