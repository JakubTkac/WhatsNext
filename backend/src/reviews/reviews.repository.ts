import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
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
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
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

    if (query.movieSlug) {
      reviewsQuery.andWhere('movie.slug = :movieSlug', {
        movieSlug: query.movieSlug,
      });
    }

    const itemsQuery = reviewsQuery
      .clone()
      .orderBy('review.createdAt', 'DESC')
      .addOrderBy('review.id', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);
    const [totalItems, items] = await Promise.all([
      reviewsQuery.getCount(),
      this.getManyWithAvatarState(itemsQuery),
    ]);

    return { items, totalItems };
  }

  async findLatest(query: LatestReviewsQueryDto): Promise<Review[]> {
    return this.getManyWithAvatarState(
      this.createListQuery()
        .orderBy('review.createdAt', 'DESC')
        .addOrderBy('review.id', 'DESC')
        .take(query.limit),
    );
  }

  async findById(id: string): Promise<Review | null> {
    const reviews = await this.getManyWithAvatarState(
      this.createListQuery().where('review.id = :id', { id }).take(1),
    );

    return reviews.at(0) ?? null;
  }

  async findByMovieSlug(slug: string): Promise<Review[]> {
    return this.getManyWithAvatarState(
      this.createListQuery()
        .where('movie.slug = :slug', { slug })
        .orderBy('review.createdAt', 'DESC')
        .addOrderBy('review.id', 'DESC'),
    );
  }

  findEligibleMovies(userId: string): Promise<Movie[]> {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoin(
        'movie.reviews',
        'existingReview',
        'existingReview.userId = :userId',
        { userId },
      )
      .select([
        'movie.id',
        'movie.slug',
        'movie.title',
        'movie.posterUrl',
        'movie.releaseDate',
      ])
      .where('movie.releaseDate <= CURRENT_DATE')
      .andWhere('existingReview.id IS NULL')
      .orderBy('movie.title', 'ASC')
      .getMany();
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
        'user.updatedAt',
        'movie.id',
        'movie.slug',
        'movie.title',
        'movie.posterUrl',
      ])
      .addSelect('"user"."avatar_url" IS NOT NULL', 'user_has_avatar');
  }

  private async getManyWithAvatarState(
    query: SelectQueryBuilder<Review>,
  ): Promise<Review[]> {
    const { entities, raw } = await query.getRawAndEntities<{
      user_has_avatar?: boolean;
    }>();

    entities.forEach((review, index) => {
      review.user.avatarUrl =
        raw[index]?.user_has_avatar === true ? 'available' : null;
    });

    return entities;
  }
}
