import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewsRepository } from '../reviews/reviews.repository';
import { getPublicAvatarUrl } from '../users/avatar-data';
import { MovieDetailsResponseDto } from './dto/movie-details-response.dto';
import { MovieSummaryDto } from './dto/movie-summary.dto';
import { MoviesQueryDto } from './dto/movies-query.dto';
import { MoviesResponseDto } from './dto/movies-response.dto';
import { UpcomingMoviesQueryDto } from './dto/upcoming-movies-query.dto';
import { UpcomingMoviesResponseDto } from './dto/upcoming-movies-response.dto';
import { Movie } from './entities/movie.entity';
import { MoviesRepository } from './movies.repository';

@Injectable()
export class MoviesService {
  constructor(
    private readonly moviesRepository: MoviesRepository,
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  async findAll(query: MoviesQueryDto): Promise<MoviesResponseDto> {
    const page = await this.moviesRepository.findPage(query);

    return {
      items: page.items.map((movie) => this.toSummary(movie)),
      meta: {
        page: query.page,
        limit: query.limit,
        totalItems: page.totalItems,
        totalPages: Math.ceil(page.totalItems / query.limit),
      },
      genres: page.genres.map((genre) => ({
        name: genre.name,
        slug: genre.slug,
      })),
    };
  }

  async findUpcoming(
    query: UpcomingMoviesQueryDto,
  ): Promise<UpcomingMoviesResponseDto> {
    const movies = await this.moviesRepository.findUpcoming(query);

    return {
      items: movies.map((movie) => this.toSummary(movie)),
    };
  }

  async findOne(slug: string): Promise<MovieDetailsResponseDto> {
    const [movie, reviews] = await Promise.all([
      this.moviesRepository.findBySlug(slug),
      this.reviewsRepository.findByMovieSlug(slug),
    ]);

    if (!movie) {
      throw new NotFoundException('Movie not found.');
    }

    const ratingTotal = reviews.reduce(
      (total, review) => total + review.rating,
      0,
    );

    return {
      ...this.toSummary(movie),
      reviewCount: reviews.length,
      averageRating:
        reviews.length === 0
          ? null
          : Math.round((ratingTotal / reviews.length) * 10) / 10,
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        body: review.body,
        createdAt: review.createdAt.toISOString(),
        author: {
          displayName: review.user.displayName,
          avatarUrl: getPublicAvatarUrl(
            review.user.id,
            Boolean(review.user.avatarUrl),
            review.user.updatedAt,
          ),
        },
      })),
    };
  }

  private toSummary(movie: Movie): MovieSummaryDto {
    return {
      slug: movie.slug,
      title: movie.title,
      description: movie.description,
      releaseDate: movie.releaseDate,
      runtimeMinutes: movie.runtimeMinutes,
      posterUrl: movie.posterUrl,
      genres: [...movie.genres]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((genre) => ({
          name: genre.name,
          slug: genre.slug,
        })),
    };
  }
}
