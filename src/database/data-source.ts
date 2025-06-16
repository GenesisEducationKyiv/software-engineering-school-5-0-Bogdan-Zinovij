import { DataSource } from 'typeorm';
import { CreateTokensTable1747437840000 } from './migrations/1747437840000-CreateTokensTable';
import { CreateSubscriptionsTable1747437840001 } from './migrations/1747437840001-CreateSubscriptionsTable';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  migrationsRun: false,
  migrations: [
    CreateTokensTable1747437840000,
    CreateSubscriptionsTable1747437840001,
  ],
  entities: [],
});
