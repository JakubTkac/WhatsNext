import 'dotenv/config';
import { hash } from 'bcrypt';
import type { EntityManager } from 'typeorm';
import { Genre } from '../../genres/entities/genre.entity';
import { Movie } from '../../movies/entities/movie.entity';
import { User } from '../../users/entities/user.entity';
import dataSource from '../data-source';
import seedData from './data/movies.json';

const SEED_USER_EMAIL = 'user123@example.com';
const SEED_USER_DISPLAY_NAME = 'user123';
const SEED_USER_PASSWORD = 'password123';

interface SeedResult {
  genres: number;
  moviesCreated: number;
  moviesUpdated: number;
  userCreated: boolean;
}

async function main(): Promise<void> {
  await dataSource.initialize();

  try {
    if (await dataSource.showMigrations()) {
      throw new Error(
        'Database has pending migrations. Run migrations before seeding.',
      );
    }

    const passwordHash = await hash(SEED_USER_PASSWORD, readBcryptRounds());
    const result = await dataSource.transaction((manager) =>
      seedDatabase(manager, passwordHash),
    );

    console.log(
      `Seed complete: ${result.genres} genres, ${result.moviesCreated} movies created, ${result.moviesUpdated} movies updated, test user ${result.userCreated ? 'created' : 'already existed'}.`,
    );
    console.log(`Test user email: ${SEED_USER_EMAIL}`);
  } finally {
    await dataSource.destroy();
  }
}

async function seedDatabase(
  manager: EntityManager,
  passwordHash: string,
): Promise<SeedResult> {
  const genreRepository = manager.getRepository(Genre);
  const movieRepository = manager.getRepository(Movie);
  const userRepository = manager.getRepository(User);

  await genreRepository.upsert(seedData.genres, ['slug']);

  const storedGenres = await genreRepository.find();
  const genreBySlug = new Map(storedGenres.map((genre) => [genre.slug, genre]));
  const storedMovies = await movieRepository.find();
  const movieBySlug = new Map(storedMovies.map((movie) => [movie.slug, movie]));

  let moviesCreated = 0;
  let moviesUpdated = 0;

  for (const movieData of seedData.movies) {
    const existingMovie = movieBySlug.get(movieData.slug);
    const movie = existingMovie ?? movieRepository.create();

    movie.title = movieData.title;
    movie.slug = movieData.slug;
    movie.description = movieData.description;
    movie.releaseDate = movieData.releaseDate;
    movie.runtimeMinutes = movieData.runtimeMinutes;
    movie.posterUrl = movieData.posterUrl;
    movie.genres = movieData.genres
      .map((genreSlug) => genreBySlug.get(genreSlug))
      .filter(isDefined);

    const savedMovie = await movieRepository.save(movie);
    movieBySlug.set(savedMovie.slug, savedMovie);

    if (existingMovie) {
      moviesUpdated += 1;
    } else {
      moviesCreated += 1;
    }
  }

  const existingUser = await userRepository.findOneBy({
    email: SEED_USER_EMAIL,
  });

  if (!existingUser) {
    await userRepository.save(
      userRepository.create({
        email: SEED_USER_EMAIL,
        passwordHash,
        displayName: SEED_USER_DISPLAY_NAME,
        bio: null,
        avatarUrl: null,
      }),
    );
  }

  return {
    genres: storedGenres.length,
    moviesCreated,
    moviesUpdated,
    userCreated: !existingUser,
  };
}

function readBcryptRounds(): number {
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

  if (!Number.isInteger(rounds) || rounds < 4 || rounds > 15) {
    throw new Error('BCRYPT_ROUNDS must be an integer between 4 and 15.');
  }

  return rounds;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

void main().catch(async (error: unknown) => {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
