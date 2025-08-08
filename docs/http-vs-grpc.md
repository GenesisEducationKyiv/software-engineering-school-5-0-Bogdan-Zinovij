# HTTP vs gRPC Performance Comparison

## What Was Tested

Two communication protocols were tested in a NestJS monorepo-based microservice architecture: **HTTP** and **gRPC**.

Specifically, I benchmarked:

1. **1000 parallel subscriptions** — each request triggered a subscription creation via either HTTP or gRPC and than sending email notification (timeout mock).
2. **Cron job simulation** — a single endpoint triggered weather email updates for all subscribers (1000 total). This simulates a CRON job.

The goal was to compare total and per-request execution time for HTTP and gRPC communication paths through an API Gateway to their respective microservices.

## Results

```
Run 1 (gRPC)
1000 subscriptions:
  Total time: 30214.94 ms
  Avg per request: 30.21 ms

Cron job (weather updates to 1000 subscribers):
  Total time: 23693.98 ms

Run 2 (HTTP)
1000 subscriptions:
  Total time: 30214.31 ms
  Avg per request: 30.21 ms

Cron job (weather updates to 1000 subscribers):
  Total time: 24581.08 ms
```

## Observations

- gRPC and HTTP performed **almost identically** for both subscription creation and cron execution.
- This is expected given the current system design:
  - Requests are small (3 fields) and use simple unary gRPC calls.
  - Both transports go through the same gateway and apply the same business logic.
  - Most time is spent in I/O operations (like sending mock emails and fetching data), not in data transport.

## What's Next

The current logic retrieves weather data **individually** for each subscriber, which leads to many repeated external API calls.

The next step is to **add batching logic** to group subscribers by city and retrieve weather once per city. This will reduce API calls and help isolate whether transport protocol actually makes a performance difference under optimized conditions.
