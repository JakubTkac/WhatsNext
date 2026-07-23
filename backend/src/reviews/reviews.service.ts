import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  IsNull,
  Not,
  QueryFailedError,
} from 'typeorm';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Movie } from '../movies/entities/movie.entity';
import { WatchlistItem } from '../watchlist/entities/watchlist-item.entity';
import { CreateReviewRequestDto } from './dto/create-review-request.dto';
import { EligibleReviewMoviesResponseDto } from './dto/eligible-review-movies-response.dto';
import { LatestReviewDto } from './dto/latest-review.dto';
import { LatestReviewsQueryDto } from './dto/latest-reviews-query.dto';
import { LatestReviewsResponseDto } from './dto/latest-reviews-response.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';
import { ReviewsResponseDto } from './dto/reviews-response.dto';
import { UpdateReviewRequestDto } from './dto/update-review-request.dto';
import { Review } from './entities/review.entity';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: ReviewsQueryDto): Promise<ReviewsResponseDto> {
    const page = await this.reviewsRepository.findPage(query);
    return this.toPageResponse(page.items, page.totalItems, query);
  }

  async findLatest(
    query: LatestReviewsQueryDto,
  ): Promise<LatestReviewsResponseDto> {
    const reviews = await this.reviewsRepository.findLatest(query);

    return {
      items: reviews.map((review) => this.toReviewResponse(review)),
    };
  }

  async findMine(
    userId: string,
    query: ReviewsQueryDto,
  ): Promise<ReviewsResponseDto> {
    const page = await this.reviewsRepository.findPage(query, userId);
    return this.toPageResponse(page.items, page.totalItems, query);
  }

  async findOne(id: string): Promise<LatestReviewDto> {
    const review = await this.reviewsRepository.findById(id);

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return this.toReviewResponse(review);
  }

  async findEligibleMovies(
    userId: string,
  ): Promise<EligibleReviewMoviesResponseDto> {
    const movies = await this.reviewsRepository.findEligibleMovies(userId);

    return {
      items: movies.map((movie) => ({
        slug: movie.slug,
        title: movie.title,
        posterUrl: movie.posterUrl,
      })),
    };
  }

  async create(
    user: AuthenticatedUser,
    request: CreateReviewRequestDto,
  ): Promise<LatestReviewDto> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const movie = await manager.getRepository(Movie).findOne({
          where: { slug: request.movieSlug },
        });

        if (!movie) {
          throw new NotFoundException('Movie not found.');
        }

        if (movie.releaseDate > currentDate()) {
          throw new BadRequestException(
            'A review can only be created after the movie is released.',
          );
        }

        const watchedMovie = await manager
          .getRepository(WatchlistItem)
          .findOne({
            where: {
              userId: user.id,
              movieId: movie.id,
              watchedAt: Not(IsNull()),
            },
          });

        if (!watchedMovie) {
          throw new BadRequestException(
            'Mark this movie as watched before reviewing it.',
          );
        }

        const reviewRepository = manager.getRepository(Review);
        const existingReview = await reviewRepository.findOne({
          where: { userId: user.id, movieId: movie.id },
        });

        if (existingReview) {
          throw new ConflictException(
            'You have already reviewed this movie.',
          );
        }

        const review = reviewRepository.create({
          userId: user.id,
          movieId: movie.id,
          rating: request.rating,
          body: request.body,
        });
        const savedReview = await reviewRepository.save(review);

        return this.toReviewResponse(savedReview, user, movie);
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'You have already reviewed this movie.',
        );
      }

      throw error;
    }
  }

  update(
    user: AuthenticatedUser,
    id: string,
    request: UpdateReviewRequestDto,
  ): Promise<LatestReviewDto> {
    if (request.rating === undefined && request.body === undefined) {
      throw new BadRequestException(
        'Provide a rating or review body to update.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const review = await this.findReviewForUpdate(manager, id);

      if (review.userId !== user.id) {
        throw new ForbiddenException(
          'You can only edit your own reviews.',
        );
      }

      if (request.rating !== undefined) {
        review.rating = request.rating;
      }

      if (request.body !== undefined) {
        review.body = request.body;
      }

      const savedReview = await manager.getRepository(Review).save(review);
      return this.toReviewResponse(savedReview);
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.reviewsRepository.deleteOwned(id, userId);

    if (!result.affected) {
      throw new NotFoundException('Review not found.');
    }
  }

  private async findReviewForUpdate(
    manager: EntityManager,
    id: string,
  ): Promise<Review> {
    const review = await manager.getRepository(Review).findOne({
      where: { id },
      relations: { user: true, movie: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return review;
  }

  private toPageResponse(
    reviews: Review[],
    totalItems: number,
    query: ReviewsQueryDto,
  ): ReviewsResponseDto {
    return {
      items: reviews.map((review) => this.toReviewResponse(review)),
      meta: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    };
  }

  private toReviewResponse(
    review: Review,
    user: AuthenticatedUser | undefined = undefined,
    movie: Movie | undefined = undefined,
  ): LatestReviewDto {
    const author = review.user ?? user;
    const reviewedMovie = review.movie ?? movie;

    if (!author || !reviewedMovie) {
      throw new Error('Review relations were not loaded.');
    }

    return {
      id: review.id,
      rating: review.rating,
      body: review.body,
      createdAt: review.createdAt.toISOString(),
      author: {
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
      },
      movie: {
        slug: reviewedMovie.slug,
        title: reviewedMovie.title,
        posterUrl: reviewedMovie.posterUrl,
      },
    };
  }
}

function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = error.driverError as { code?: string };
  return driverError.code === '23505';
}
