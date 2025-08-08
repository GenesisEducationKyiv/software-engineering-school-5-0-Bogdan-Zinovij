# ADR: Extract Email Delivery to a Dedicated Microservice

## Status

Accepted

## Context

Currently, the `MailModule` in the monolith handles all outbound emails:

- confirmation link after subscription
- success notice after confirmation
- unsubscribe notice
- periodic weather forecast (via CRON)

The email-sending logic is tightly coupled into the `SubscriptionService`, and uses `MailService`, which relies on SMTP and templates from `mail.templates.ts`.

This approach has several downsides:

- blocks user-facing flows due to slow email delivery
- mixes concerns: email rendering and delivery inside core logic
- limits scalability: no horizontal scaling of mail delivery

## Decision

Extract the email logic into a dedicated microservice `email-service`.

### Changes:

- Remove `MailModule`, `MailService`, `mail.templates.ts` from monolith
- Replace them with `EmailClientService` that publishes messages to RabbitMQ
- Introduce RabbitMQ-based communication via `@nestjs/microservices`
- Email service will listen to `email.send` topic and deliver emails via SMTP

### Communication

- **Broker**: RabbitMQ
- **Pattern**: Fire-and-forget (`emit`) to `email.send`
- **Payload**:

````ts
{
  to: string;
  type: 'confirm' | 'confirmed' | 'unsubscribe' | 'forecast';
  params: Record<string, any>;
}
Contract: **Contract**
Defined in shared `SendEmailDto`

---

### Affected Components

#### In Monolith:

- **MailModule** and **MailService** removed

- **SubscriptionService**:
  - replace `.sendMail(...)` calls with `.emit(...)` to RabbitMQ via `EmailClientService`
  - no longer imports SMTP or templates

- **SubscriptionCronService**:
  - forecast emails sent via RabbitMQ too

- Unit tests mocking `MailService` updated to mock `EmailClientService`

- Integration tests updated with stub RabbitMQ

#### In email-service:

- New NestJS microservice
- Listens on `email.send` queue
- Uses `@nestjs-modules/mailer` and SendPulse SMTP
- Uses same templates from extracted `mail.templates.ts`
- Implements retry logic via RabbitMQ dead-letter queue
- Logs success/failure for observability

---

### Migration Plan

1. Create new `email-service` NestJS app
2. Move `MailService` and `mail.templates.ts` into it
3. Add RabbitMQ handler:
   ```ts
   @MessagePattern('email.send')
   handleSendEmail(data: SendEmailDto) Ellipsis
````

4. In main app:
   - Remove `MailModule` and SMTP config
   - Add `EmailClientService` (RabbitMQ producer)
   - Update all `.sendMail(...)` usages
   - Setup RabbitMQ queue and retry policy
   - Update Docker Compose to include email service and RabbitMQ
   - Update test coverage - mocks, stubs
   - Monitor email queue metrics and delivery logs

---

### Consequences

#### Benefits

- Fully decouples email concerns from business logic
- Enables independent scaling and fault isolation
- Improves response time of user-facing endpoints
- Easier observability and retries
- Prepares the system for horizontal scaling

#### Trade-offs

- Adds RabbitMQ infrastructure dependency
- Requires coordination for shared types and templates
- Deployment of new microservice required

---

### Alternatives Considered

- **Monolith(as it is now)**: limits scalability and resilience
- **HTTP-based microservice**: rejected due to synchronous nature
- **gRPC**: too tightly coupled and complex for fire-and-forget
- **BullMQ queue**: considered earlier in SDD; RabbitMQ provides broader support for pub-sub and retry

---

### Related Components

To be removed/replaced:

- `MailModule`
- `MailService`
- `mail.templates.ts`
- All SMTP settings in main `.env`

To be added:

- `email-service` NestJS app
- `EmailClientService` in monolith
- `SendEmailDto` (shared contract)

---

### Outcome

The system becomes more scalable, modular and failure-tolerant. Email logic is encapsulated and independently operable. All latency-sensitive parts of the main app are no longer affected by email delays or SMTP failures.
