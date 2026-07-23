import 'dotenv/config';
import { hash } from 'bcrypt';
import type { EntityManager } from 'typeorm';
import { Genre } from '../../genres/entities/genre.entity';
import { Movie } from '../../movies/entities/movie.entity';
import { Review } from '../../reviews/entities/review.entity';
import { User } from '../../users/entities/user.entity';
import { WatchlistItem } from '../../watchlist/entities/watchlist-item.entity';
import dataSource from '../data-source';
import communityData from './data/community.json';
import seedData from './data/movies.json';

const SEED_USER_EMAIL = 'user123@example.com';
const SEED_USER_PASSWORD = 'password123';
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

interface ReviewSeedData {
  userEmail: string;
  movieSlug: string;
  rating: number;
  body: string;
  watchedAt: string;
  createdAt: string;
}

interface SeedResult {
  genres: number;
  moviesCreated: number;
  moviesUpdated: number;
  usersCreated: number;
  usersUpdated: number;
  watchlistItems: number;
  reviewsCreated: number;
  reviewsUpdated: number;
}

async function main(): Promise<void> {
  await dataSource.initialize();

  try {
    if (await dataSource.showMigrations()) {
      throw new Error(
        'Database has pending migrations. Run migrations before seeding.',
      );
    }

    if (
      process.argv.includes('--if-empty') &&
      (await dataSource.getRepository(Movie).count()) > 0
    ) {
      console.log('Seed skipped: the movie catalogue is already initialized.');
      return;
    }

    const passwordHash = await hash(SEED_USER_PASSWORD, readBcryptRounds());
    const result = await dataSource.transaction((manager) =>
      seedDatabase(manager, passwordHash),
    );

    console.log(
      `Seed complete: ${result.genres} genres, ${result.moviesCreated} movies created, ${result.moviesUpdated} movies updated, ${result.usersCreated} users created, ${result.usersUpdated} users updated, ${result.watchlistItems} watched movies, ${result.reviewsCreated} reviews created, ${result.reviewsUpdated} reviews updated.`,
    );
    console.log(`Test user email: ${SEED_USER_EMAIL}`);
    console.log(`Demo user password: ${SEED_USER_PASSWORD}`);
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
  const watchlistRepository = manager.getRepository(WatchlistItem);
  const reviewRepository = manager.getRepository(Review);

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

  const storedUsers = await userRepository.find();
  const userByEmail = new Map(storedUsers.map((user) => [user.email, user]));
  let usersCreated = 0;
  let usersUpdated = 0;

  for (const userData of communityData.users) {
    const existingUser = userByEmail.get(userData.email);
    const user = existingUser ?? userRepository.create({ passwordHash });

    user.email = userData.email;
    user.displayName = userData.displayName;
    user.bio = userData.bio;
    user.avatarUrl = userData.avatarUrl;

    if (!existingUser) {
      user.createdAt = new Date('2026-06-01T12:00:00.000Z');
    }

    const savedUser = await userRepository.save(user);
    userByEmail.set(savedUser.email, savedUser);

    if (existingUser) {
      usersUpdated += 1;
    } else {
      usersCreated += 1;
    }
  }

  const storedWatchlistItems = await watchlistRepository.find();
  const watchlistByUserAndMovie = new Map(
    storedWatchlistItems.map((item) => [
      createRelationKey(item.userId, item.movieId),
      item,
    ]),
  );
  const storedReviews = await reviewRepository.find();
  const reviewByUserAndMovie = new Map(
    storedReviews.map((review) => [
      createRelationKey(review.userId, review.movieId),
      review,
    ]),
  );
  const reviewSeedData = createReviewSeedData();
  const seededWatchlistRelations = new Set<string>();
  let reviewsCreated = 0;
  let reviewsUpdated = 0;

  for (const watchedMovieData of communityData.watchedMovies) {
    const user = userByEmail.get(watchedMovieData.userEmail);
    const movie = movieBySlug.get(watchedMovieData.movieSlug);

    if (!user || !movie) {
      throw new Error(
        `Watched-movie seed references missing user or movie: ${watchedMovieData.userEmail}, ${watchedMovieData.movieSlug}.`,
      );
    }

    if (movie.releaseDate > watchedMovieData.watchedAt.slice(0, 10)) {
      throw new Error(
        `Watched-movie seed marks ${watchedMovieData.movieSlug} watched before its release date.`,
      );
    }

    const watchedAt = new Date(watchedMovieData.watchedAt);
    const relationKey = createRelationKey(user.id, movie.id);
    seededWatchlistRelations.add(relationKey);
    const existingWatchlistItem = watchlistByUserAndMovie.get(relationKey);
    const watchlistItem =
      existingWatchlistItem ?? watchlistRepository.create();

    watchlistItem.userId = user.id;
    watchlistItem.movieId = movie.id;
    watchlistItem.addedAt = new Date(
      watchedAt.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    watchlistItem.watchedAt = watchedAt;

    const savedWatchlistItem = await watchlistRepository.save(watchlistItem);
    watchlistByUserAndMovie.set(relationKey, savedWatchlistItem);
  }

  for (const reviewData of reviewSeedData) {
    const user = userByEmail.get(reviewData.userEmail);
    const movie = movieBySlug.get(reviewData.movieSlug);

    if (!user || !movie) {
      throw new Error(
        `Review seed references missing user or movie: ${reviewData.userEmail}, ${reviewData.movieSlug}.`,
      );
    }

    const watchedAt = new Date(reviewData.watchedAt);
    const createdAt = new Date(reviewData.createdAt);

    if (movie.releaseDate > reviewData.watchedAt.slice(0, 10)) {
      throw new Error(
        `Review seed marks ${reviewData.movieSlug} watched before its release date.`,
      );
    }

    if (watchedAt > createdAt) {
      throw new Error(
        `Review seed for ${reviewData.movieSlug} was created before it was watched.`,
      );
    }

    const relationKey = createRelationKey(user.id, movie.id);
    seededWatchlistRelations.add(relationKey);
    const existingWatchlistItem = watchlistByUserAndMovie.get(relationKey);
    const watchlistItem =
      existingWatchlistItem ?? watchlistRepository.create();

    watchlistItem.userId = user.id;
    watchlistItem.movieId = movie.id;
    watchlistItem.addedAt = new Date(
      watchedAt.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    watchlistItem.watchedAt = watchedAt;

    const savedWatchlistItem = await watchlistRepository.save(watchlistItem);
    watchlistByUserAndMovie.set(relationKey, savedWatchlistItem);

    const existingReview = reviewByUserAndMovie.get(relationKey);
    const review = existingReview ?? reviewRepository.create();

    review.userId = user.id;
    review.movieId = movie.id;
    review.rating = reviewData.rating;
    review.body = reviewData.body;
    review.createdAt = createdAt;

    const savedReview = await reviewRepository.save(review);
    reviewByUserAndMovie.set(relationKey, savedReview);

    if (existingReview) {
      reviewsUpdated += 1;
    } else {
      reviewsCreated += 1;
    }
  }

  return {
    genres: storedGenres.length,
    moviesCreated,
    moviesUpdated,
    usersCreated,
    usersUpdated,
    watchlistItems: seededWatchlistRelations.size,
    reviewsCreated,
    reviewsUpdated,
  };
}

function createReviewSeedData(): ReviewSeedData[] {
  const generation = communityData.generatedReviews;
  const seededUserEmails = new Set(
    communityData.users.map((user) => user.email),
  );
  const movieBySlug = new Map(
    seedData.movies.map((movie) => [movie.slug, movie]),
  );
  const reviewKeys = new Set<string>();
  const reviewCountByUser = new Map(
    communityData.users.map((user) => [user.email, 0]),
  );
  const reviews: ReviewSeedData[] = [];

  validateReviewGenerationConfiguration();

  for (const review of communityData.reviews) {
    if (!seededUserEmails.has(review.userEmail)) {
      throw new Error(
        `Review seed references missing user: ${review.userEmail}.`,
      );
    }

    if (!movieBySlug.has(review.movieSlug)) {
      throw new Error(
        `Review seed references missing movie: ${review.movieSlug}.`,
      );
    }

    const relationKey = createSeedRelationKey(
      review.userEmail,
      review.movieSlug,
    );

    if (reviewKeys.has(relationKey)) {
      throw new Error(
        `Review seed contains a duplicate user and movie pair: ${review.userEmail}, ${review.movieSlug}.`,
      );
    }

    reviewKeys.add(relationKey);
    reviewCountByUser.set(
      review.userEmail,
      (reviewCountByUser.get(review.userEmail) ?? 0) + 1,
    );
    reviews.push(review);
  }

  const eligibleMovies = seedData.movies
    .filter(
      (movie) => movie.releaseDate <= generation.latestMovieReleaseDate,
    )
    .sort(
      (left, right) =>
        left.releaseDate.localeCompare(right.releaseDate) ||
        left.slug.localeCompare(right.slug),
    );

  if (eligibleMovies.length < generation.reviewsPerUser) {
    throw new Error(
      `Review generation needs at least ${generation.reviewsPerUser} eligible movies, but only ${eligibleMovies.length} are available.`,
    );
  }

  for (const [userIndex, user] of communityData.users.entries()) {
    let reviewCount = reviewCountByUser.get(user.email) ?? 0;
    let candidateOffset = 0;

    while (
      reviewCount < generation.reviewsPerUser &&
      candidateOffset < eligibleMovies.length
    ) {
      const movieIndex =
        (userIndex * 11 + candidateOffset) % eligibleMovies.length;
      const movie = eligibleMovies[movieIndex];
      const relationKey = createSeedRelationKey(user.email, movie.slug);

      candidateOffset += 1;

      if (reviewKeys.has(relationKey)) {
        continue;
      }

      const rating =
        generation.ratings[
          (userIndex * 3 + reviewCount) % generation.ratings.length
        ];
      const bodyTemplate =
        generation.bodies[
          (userIndex * 5 + reviewCount) % generation.bodies.length
        ];
      const releaseAt = new Date(`${movie.releaseDate}T18:00:00.000Z`);
      const watchedAt = new Date(
        releaseAt.getTime() +
          ((userIndex + candidateOffset) % 3) * DAY_IN_MILLISECONDS +
          userIndex * 7 * 60 * 1000,
      );
      const createdAt = new Date(
        watchedAt.getTime() +
          (90 + ((userIndex * 17 + candidateOffset) % 120)) * 60 * 1000,
      );

      reviews.push({
        userEmail: user.email,
        movieSlug: movie.slug,
        rating,
        body: bodyTemplate.replace('{title}', movie.title),
        watchedAt: watchedAt.toISOString(),
        createdAt: createdAt.toISOString(),
      });
      reviewKeys.add(relationKey);
      reviewCount += 1;
    }

    if (reviewCount < generation.reviewsPerUser) {
      throw new Error(
        `Could not generate ${generation.reviewsPerUser} unique reviews for ${user.email}.`,
      );
    }
  }

  return reviews;
}

function validateReviewGenerationConfiguration(): void {
  const generation = communityData.generatedReviews;

  if (
    !Number.isInteger(generation.reviewsPerUser) ||
    generation.reviewsPerUser < 1
  ) {
    throw new Error(
      'generatedReviews.reviewsPerUser must be a positive integer.',
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(generation.latestMovieReleaseDate)) {
    throw new Error(
      'generatedReviews.latestMovieReleaseDate must use YYYY-MM-DD.',
    );
  }

  if (
    generation.ratings.length === 0 ||
    generation.ratings.some(
      (rating) => !Number.isInteger(rating) || rating < 1 || rating > 10,
    )
  ) {
    throw new Error(
      'generatedReviews.ratings must contain integers from 1 through 10.',
    );
  }

  if (
    generation.bodies.length === 0 ||
    generation.bodies.some((body) => body.length < 10 || body.length > 2000)
  ) {
    throw new Error(
      'generatedReviews.bodies must contain text between 10 and 2000 characters.',
    );
  }
}

function createRelationKey(userId: string, movieId: string): string {
  return `${userId}:${movieId}`;
}

function createSeedRelationKey(userEmail: string, movieSlug: string): string {
  return `${userEmail}:${movieSlug}`;
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
