import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LatestReviewDto } from './dto/latest-review.dto';
import { LatestReviewsQueryDto } from './dto/latest-reviews-query.dto';
import { LatestReviewsResponseDto } from './dto/latest-reviews-response.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async findLatest(
    query: LatestReviewsQueryDto,
  ): Promise<LatestReviewsResponseDto> {
    const reviews = await this.reviewRepository
      .createQueryBuilder('review')
      .innerJoinAndSelect('review.user', 'user')
      .innerJoinAndSelect('review.movie', 'movie')
      .select([
        'review.id',
        'review.rating',
        'review.body',
        'review.createdAt',
        'user.id',
        'user.displayName',
        'user.avatarUrl',
        'movie.id',
        'movie.slug',
        'movie.title',
        'movie.posterUrl',
      ])
      .orderBy('review.createdAt', 'DESC')
      .addOrderBy('review.id', 'DESC')
      .take(query.limit)
      .getMany();

    return {
      items: reviews.map((review) => this.toLatestReview(review)),
    };
  }

  private toLatestReview(review: Review): LatestReviewDto {
    return {
      id: review.id,
      rating: review.rating,
      body: review.body,
      createdAt: review.createdAt.toISOString(),
      author: {
        displayName: review.user.displayName,
        avatarUrl: review.user.avatarUrl,
      },
      movie: {
        slug: review.movie.slug,
        title: review.movie.title,
        posterUrl: review.movie.posterUrl,
      },
    };
  }
}
