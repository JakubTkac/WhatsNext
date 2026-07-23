import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Review } from '../reviews/entities/review.entity';
import { WatchlistItem } from '../watchlist/entities/watchlist-item.entity';
import { isValidAvatarDataUrl } from './avatar-data';
import {
  ProfileResponseDto,
  ProfileReviewDto,
  ProfileWatchlistItemDto,
} from './dto/profile-response.dto';
import { UpdateProfileRequestDto } from './dto/update-profile-request.dto';
import { User } from './entities/user.entity';

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  displayName: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(WatchlistItem)
    private readonly watchlistRepository: Repository<WatchlistItem>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByIdWithPassword(id: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.userRepository.update({ id }, { passwordHash });
  }

  async create(input: CreateUserInput): Promise<User> {
    try {
      return await this.userRepository.save(
        this.userRepository.create({
          email: input.email,
          passwordHash: input.passwordHash,
          displayName: input.displayName,
          bio: null,
          avatarUrl: null,
        }),
      );
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('An account with this email already exists.');
      }

      throw error;
    }
  }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const [user, reviewCount, watchlistCount, reviews, watchlistItems] =
      await Promise.all([
        this.userRepository.findOneBy({ id: userId }),
        this.reviewRepository.countBy({ userId }),
        this.watchlistRepository.countBy({ userId }),
        this.findRecentReviews(userId),
        this.findWatchlistPreview(userId),
      ]);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
      stats: {
        watchlistCount,
        reviewCount,
      },
      recentReviews: reviews.map(toProfileReview),
      watchlistPreview: watchlistItems.map(toProfileWatchlistItem),
    };
  }

  async updateProfile(
    userId: string,
    request: UpdateProfileRequestDto,
  ): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (
      typeof request.avatarDataUrl === 'string' &&
      !isValidAvatarDataUrl(request.avatarDataUrl)
    ) {
      throw new BadRequestException(
        'Avatar must be a valid PNG, JPEG, or WebP image up to 256 KB.',
      );
    }

    let hasChanges = false;

    if (
      request.displayName !== undefined &&
      request.displayName !== user.displayName
    ) {
      user.displayName = request.displayName;
      hasChanges = true;
    }

    if (request.email !== undefined && request.email !== user.email) {
      user.email = request.email;
      hasChanges = true;
    }

    if (request.bio !== undefined && request.bio !== user.bio) {
      user.bio = request.bio;
      hasChanges = true;
    }

    if (
      request.avatarDataUrl !== undefined &&
      request.avatarDataUrl !== user.avatarUrl
    ) {
      user.avatarUrl = request.avatarDataUrl;
      hasChanges = true;
    }

    if (!hasChanges) {
      return this.getProfile(userId);
    }

    try {
      await this.userRepository.save(user);
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }

      throw error;
    }

    return this.getProfile(userId);
  }

  private findRecentReviews(userId: string): Promise<Review[]> {
    return this.reviewRepository
      .createQueryBuilder('review')
      .innerJoinAndSelect('review.movie', 'movie')
      .select([
        'review.id',
        'review.rating',
        'review.body',
        'review.createdAt',
        'movie.id',
        'movie.slug',
        'movie.title',
        'movie.releaseDate',
        'movie.posterUrl',
      ])
      .where('review.userId = :userId', { userId })
      .orderBy('review.createdAt', 'DESC')
      .addOrderBy('review.id', 'DESC')
      .take(3)
      .getMany();
  }

  private findWatchlistPreview(userId: string): Promise<WatchlistItem[]> {
    return this.watchlistRepository
      .createQueryBuilder('watchlistItem')
      .innerJoinAndSelect('watchlistItem.movie', 'movie')
      .select([
        'watchlistItem.id',
        'watchlistItem.addedAt',
        'watchlistItem.watchedAt',
        'movie.id',
        'movie.slug',
        'movie.title',
        'movie.releaseDate',
        'movie.posterUrl',
      ])
      .where('watchlistItem.userId = :userId', { userId })
      .orderBy('watchlistItem.addedAt', 'DESC')
      .addOrderBy('watchlistItem.id', 'DESC')
      .take(4)
      .getMany();
  }
}

function toProfileReview(review: Review): ProfileReviewDto {
  return {
    id: review.id,
    rating: review.rating,
    body: review.body,
    createdAt: review.createdAt.toISOString(),
    movie: {
      slug: review.movie.slug,
      title: review.movie.title,
      releaseDate: review.movie.releaseDate,
      posterUrl: review.movie.posterUrl,
    },
  };
}

function toProfileWatchlistItem(
  watchlistItem: WatchlistItem,
): ProfileWatchlistItemDto {
  return {
    id: watchlistItem.id,
    addedAt: watchlistItem.addedAt.toISOString(),
    watchedAt: watchlistItem.watchedAt?.toISOString() ?? null,
    movie: {
      slug: watchlistItem.movie.slug,
      title: watchlistItem.movie.title,
      releaseDate: watchlistItem.movie.releaseDate,
      posterUrl: watchlistItem.movie.posterUrl,
    },
  };
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  return (error.driverError as { code?: string }).code === '23505';
}
