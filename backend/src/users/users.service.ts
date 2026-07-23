import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { Review } from '../reviews/entities/review.entity';
import { WatchlistItem } from '../watchlist/entities/watchlist-item.entity';
import {
  decodeAvatarDataUrl,
  getPublicAvatarUrl,
  isValidAvatarDataUrl,
  type AvatarImage,
} from './avatar-data';
import {
  ProfileMovieDto,
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

const PROFILE_RECENT_REVIEWS_LIMIT = 4;
const PROFILE_WATCHLIST_PREVIEW_LIMIT = 6;

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
    return this.findUserWithAvatarState(
      this.createAuthUserQuery().where('user.id = :id', { id }),
    );
  }

  async getAvatar(userId: string): Promise<AvatarImage> {
    const user = await this.userRepository.findOne({
      select: { avatarUrl: true },
      where: { id: userId },
    });
    const avatar = user?.avatarUrl
      ? decodeAvatarDataUrl(user.avatarUrl)
      : null;

    if (!avatar) {
      throw new NotFoundException('Avatar not found.');
    }

    return avatar;
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.findUserWithAvatarState(
      this.createAuthUserQuery()
        .addSelect('user.passwordHash')
        .where('user.email = :email', { email }),
    );
  }

  findByIdWithPassword(id: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.passwordHash'])
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
        this.findProfileById(userId),
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
      avatarUrl: getPublicAvatarUrl(
        user.id,
        Boolean(user.avatarUrl),
        user.updatedAt,
      ),
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
      .leftJoinAndSelect('movie.genres', 'genre')
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
        'movie.runtimeMinutes',
        'genre.id',
        'genre.name',
        'genre.slug',
      ])
      .where('review.userId = :userId', { userId })
      .orderBy('review.createdAt', 'DESC')
      .addOrderBy('review.id', 'DESC')
      .take(PROFILE_RECENT_REVIEWS_LIMIT)
      .getMany();
  }

  private findWatchlistPreview(userId: string): Promise<WatchlistItem[]> {
    return this.watchlistRepository
      .createQueryBuilder('watchlistItem')
      .innerJoinAndSelect('watchlistItem.movie', 'movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .select([
        'watchlistItem.id',
        'watchlistItem.addedAt',
        'watchlistItem.watchedAt',
        'movie.id',
        'movie.slug',
        'movie.title',
        'movie.releaseDate',
        'movie.posterUrl',
        'movie.runtimeMinutes',
        'genre.id',
        'genre.name',
        'genre.slug',
      ])
      .where('watchlistItem.userId = :userId', { userId })
      .andWhere('movie.releaseDate >= CURRENT_DATE')
      .orderBy('movie.releaseDate', 'ASC')
      .addOrderBy('movie.id', 'ASC')
      .take(PROFILE_WATCHLIST_PREVIEW_LIMIT)
      .getMany();
  }

  private createAuthUserQuery(): SelectQueryBuilder<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.displayName',
        'user.bio',
        'user.updatedAt',
      ])
      .addSelect('"user"."avatar_url" IS NOT NULL', 'user_has_avatar');
  }

  private findProfileById(userId: string): Promise<User | null> {
    return this.findUserWithAvatarState(
      this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.email',
          'user.displayName',
          'user.bio',
          'user.createdAt',
          'user.updatedAt',
        ])
        .addSelect(
          '"user"."avatar_url" IS NOT NULL',
          'user_has_avatar',
        )
        .where('user.id = :userId', { userId }),
    );
  }

  private async findUserWithAvatarState(
    query: SelectQueryBuilder<User>,
  ): Promise<User | null> {
    const { entities, raw } = await query.getRawAndEntities<{
      user_has_avatar?: boolean;
    }>();
    const user = entities.at(0);

    if (!user) {
      return null;
    }

    user.avatarUrl =
      raw.at(0)?.user_has_avatar === true ? 'available' : null;

    return user;
  }
}

function toProfileReview(review: Review): ProfileReviewDto {
  return {
    id: review.id,
    rating: review.rating,
    body: review.body,
    createdAt: review.createdAt.toISOString(),
    movie: toProfileMovie(review.movie),
  };
}

function toProfileWatchlistItem(
  watchlistItem: WatchlistItem,
): ProfileWatchlistItemDto {
  return {
    id: watchlistItem.id,
    addedAt: watchlistItem.addedAt.toISOString(),
    watchedAt: watchlistItem.watchedAt?.toISOString() ?? null,
    movie: toProfileMovie(watchlistItem.movie),
  };
}

function toProfileMovie(movie: Movie): ProfileMovieDto {
  return {
    slug: movie.slug,
    title: movie.title,
    releaseDate: movie.releaseDate,
    posterUrl: movie.posterUrl,
    runtimeMinutes: movie.runtimeMinutes,
    genres: movie.genres.map((genre) => ({
      name: genre.name,
      slug: genre.slug,
    })),
  };
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  return (error.driverError as { code?: string }).code === '23505';
}
