import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { WatchlistItemDto, WatchlistResponseDto } from './dto/watchlist-response.dto';
import { WatchlistItem } from './entities/watchlist-item.entity';
import { WatchlistRepository } from './watchlist.repository';

@Injectable()
export class WatchlistService {
  constructor(private readonly watchlistRepository: WatchlistRepository) {}

  async findAll(userId: string): Promise<WatchlistResponseDto> {
    const items = await this.watchlistRepository.findForUser(userId);
    return { items: items.map(toResponse) };
  }

  async add(userId: string, movieSlug: string): Promise<WatchlistItemDto> {
    const movie = await this.watchlistRepository.findMovieBySlug(movieSlug);

    if (!movie) {
      throw new NotFoundException('Movie not found.');
    }

    const existingItem = await this.watchlistRepository.findItem(
      userId,
      movie.id,
    );

    if (existingItem) {
      return toResponse(existingItem);
    }

    try {
      const savedItem = await this.watchlistRepository.save(
        this.watchlistRepository.create(userId, movie),
      );
      return toResponse(savedItem);
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }

      const concurrentItem = await this.watchlistRepository.findItem(
        userId,
        movie.id,
      );

      if (!concurrentItem) {
        throw error;
      }

      return toResponse(concurrentItem);
    }
  }

  async remove(userId: string, movieSlug: string): Promise<void> {
    const movie = await this.watchlistRepository.findMovieBySlug(movieSlug);

    if (!movie) {
      return;
    }

    await this.watchlistRepository.delete(userId, movie.id);
  }
}

function toResponse(item: WatchlistItem): WatchlistItemDto {
  return {
    id: item.id,
    addedAt: item.addedAt.toISOString(),
    watchedAt: item.watchedAt?.toISOString() ?? null,
    movie: {
      slug: item.movie.slug,
      title: item.movie.title,
      releaseDate: item.movie.releaseDate,
      posterUrl: item.movie.posterUrl,
    },
  };
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  return (error.driverError as { code?: string }).code === '23505';
}
