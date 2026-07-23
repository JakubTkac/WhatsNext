import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { WatchlistItem } from '../watchlist/entities/watchlist-item.entity';
import { LatestReviewsQueryDto } from './dto/latest-reviews-query.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';
import { Review } from './entities/review.entity';

export interface ReviewPage {
  items: Review[];
  totalItems: number;
}

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(WatchlistItem)
    private readonly watchlistRepository: Repository<WatchlistItem>,
  ) {}

  async findPage(
    query: ReviewsQueryDto,
    userId?: string,
  ): Promise<ReviewPage> {
    const reviewsQuery = this.createListQuery();

    if (userId) {
      reviewsQuery.andWhere('review.userId = :userId', { userId });
    }

    if (query.rating) {
      reviewsQuery.andWhere('review.rating = :rating', {
        rating: query.rating,
      });
    }

    if (query.movie) {
      reviewsQuery.andWhere(
        'STRPOS(LOWER(movie.title), LOWER(:movieSearch)) > 0',
        { movieSearch: query.movie },
      );
    }

    const [items, totalItems] = await reviewsQuery
      .orderBy('review.createdAt', 'DESC')
      .addOrderBy('review.id', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return { items, totalItems };
  }

  findLatest(query: LatestReviewsQueryDto): Promise<Review[]> {
    return this.createListQuery()
      .orderBy('review.createdAt', 'DESC')
      .addOrderBy('review.id', 'DESC')
      .take(query.limit)
      .getMany();
  }

  findById(id: string): Promise<Review | null> {
    return this.createListQuery()
      .where('review.id = :id', { id })
      .getOne();
  }

  async findEligibleMovies(userId: string): Promise<Movie[]> {
    const watchlistItems = await this.watchlistRepository
      .createQueryBuilder('watchlistItem')
      .innerJoinAndSelect('watchlistItem.movie', 'movie')
      .leftJoin(
        'movie.reviews',
        'existingReview',
        'existingReview.userId = :userId',
        { userId },
      )
      .select([
        'watchlistItem.id',
        'movie.id',
        'movie.slug',
        'movie.title',
        'movie.posterUrl',
        'movie.releaseDate',
      ])
      .where('watchlistItem.userId = :userId', { userId })
      .andWhere('watchlistItem.watchedAt IS NOT NULL')
      .andWhere('movie.releaseDate <= CURRENT_DATE')
      .andWhere('existingReview.id IS NULL')
      .orderBy('movie.title', 'ASC')
      .getMany();

    return watchlistItems.map((item) => item.movie);
  }

  deleteOwned(id: string, userId: string): Promise<DeleteResult> {
    return this.reviewRepository.delete({ id, userId });
  }

  private createListQuery(): SelectQueryBuilder<Review> {
    return this.reviewRepository
      .createQueryBuilder('review')
      .innerJoinAndSelect('review.user', 'user')
      .innerJoinAndSelect('review.movie', 'movie')
      .select([
        'review.id',
        'review.userId',
        'review.movieId',
        'review.rating',
        'review.body',
        'review.createdAt',
        'review.updatedAt',
        'user.id',
        'user.displayName',
        'user.avatarUrl',
        'movie.id',
        'movie.slug',
        'movie.title',
        'movie.posterUrl',
      ]);
  }
}
