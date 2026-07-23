import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { WatchlistItem } from './entities/watchlist-item.entity';

@Injectable()
export class WatchlistRepository {
  constructor(
    @InjectRepository(WatchlistItem)
    private readonly watchlistRepository: Repository<WatchlistItem>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  findForUser(userId: string): Promise<WatchlistItem[]> {
    return this.watchlistRepository
      .createQueryBuilder('watchlistItem')
      .innerJoinAndSelect('watchlistItem.movie', 'movie')
      .select([
        'watchlistItem.id',
        'watchlistItem.userId',
        'watchlistItem.movieId',
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
      .take(500)
      .getMany();
  }

  findMovieBySlug(slug: string): Promise<Movie | null> {
    return this.movieRepository.findOne({
      select: {
        id: true,
        slug: true,
        title: true,
        releaseDate: true,
        posterUrl: true,
      },
      where: { slug },
    });
  }

  findItem(userId: string, movieId: string): Promise<WatchlistItem | null> {
    return this.watchlistRepository.findOne({
      where: { userId, movieId },
      relations: { movie: true },
    });
  }

  create(userId: string, movie: Movie): WatchlistItem {
    return this.watchlistRepository.create({
      userId,
      movieId: movie.id,
      movie,
      watchedAt: null,
    });
  }

  save(item: WatchlistItem): Promise<WatchlistItem> {
    return this.watchlistRepository.save(item);
  }

  delete(userId: string, movieId: string): Promise<DeleteResult> {
    return this.watchlistRepository.delete({ userId, movieId });
  }
}
