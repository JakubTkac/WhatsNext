import 'dotenv/config';
import { DataSource } from 'typeorm';

const useSsl = process.env.DB_SSL === 'true';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});
