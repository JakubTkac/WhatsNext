import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Genre } from '../genres/entities/genre.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { WatchlistItem } from '../watchlist/entities/watchlist-item.entity';

const useSsl = process.env.DB_SSL === 'true';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Movie, Genre, WatchlistItem, Review],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});
