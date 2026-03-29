# 🌤️ Weather forecast subscription service

Application allows users to subscribe to receive regular weather forecasts by email for a selected city. Hourly or daily update frequency is supported. There is also an option to confirm or cancel the subscription using a token

---

## Deployment Instruction

1. Clone the repository:

   ```bash
   git clone https://github.com/Bogdan-Zinovij/weather-subscription-service.git
   cd weather-subscription-service
   ```

2. Download `.env` file from Google Drive and place it in the project's root directory.
   👉 [Download: `.env`](https://drive.google.com/file/d/1goJ6jrW1zd5qThr0Y0o7xgsQysHiN6I7/view?usp=sharing)

3. Run the application using Docker Compose:

   ```bash
   docker compose up
   ```

   The application will be available locally on port 3000.
   Example request URL:
   http://localhost:3000/weather?city=Kyiv

   - _Note_1_: Among the logs during service startup, logs for launching migrations of Tokens, Subscriptions tables and adding a relationship between them will also be displayed. (Migration files are located in /src/database/migrations)
   - _Note_2_: Existing API contracts described in the documentation have not changed. Some API responses have been expanded with an error message text.

---

## Deployment

The application has been deployed on AWS EC2. The API and the HTML page for subscription via link are hosted here:
🔗 [http://ec2-54-67-118-137.us-west-1.compute.amazonaws.com](http://ec2-54-67-118-137.us-west-1.compute.amazonaws.com)

---

## Technologies and Services Used

Technologies:

- **NestJS** — a framework with a modular architecture for Node.js
- **TypeScript** — as the primary programming language with strict typing
- **PostgreSQL** — a relational database for storing application data
- **TypeORM** — an ORM for simplified database interaction
- **Docker / Docker Compose** — for containerization and local deployment
- **@nestjs-modules/mailer** — for sending email notifications
- **AWS EC2** — application hosting

Third-party Services:

- **WeatherAPI.com** — an external source for weather data
- **SendPulse.com** — an SMTP server for sending email messages

---

## Architecture

The application is built on the principles of **Clean Architecture**, ensuring scalability, testability, and clean business logic.

- **Domain models** (`Subscription`, `Weather`) are isolated from infrastructure implementation. They are used exclusively within the business logic.
- **Mapping** between domain models and ORM entities in repositories (`SubscriptionEntity`, `TokenEntity`) is implemented separately to avoid mixing business logic with database technical details. In the service layer, all operations are performed only with domain models.
- **Repository interfaces** define data access behavior, while the concrete implementation (based on TypeORM) is encapsulated within the infrastructure layer.
- The code is divided into layers:
  - `application` — business logic, services
  - `infrastructure` — database access (entities, repositories), third-party APIs
  - `interfaces` — controllers, input/output ports
- Modularity — each module encapsulates a distinct domain model (or service) and its associated logic. Common constants and interfaces are placed in the `common` folder.

---

## Module Interaction

- A user sends a **POST /subscribe** request with their email, city, and update interval.

  - `SubscriptionService` creates the subscription by calling the repository and `TokenService` to generate a token.
  - An email with the token is sent via `MailerService`.

---
