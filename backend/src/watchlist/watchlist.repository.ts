import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { Genre } from '../genres/entities/genre.entity';
import {
  MovieReleaseFilter,
  MovieSort,
} from '../movies/dto/movies-query.dto';
import { Movie } from '../movies/entities/movie.entity';
import { WatchlistQueryDto } from './dto/watchlist-query.dto';
import { WatchlistItem } from './entities/watchlist-item.entity';

export interface WatchlistPage {
  items: WatchlistItem[];
  totalItems: number;
  genres: Genre[];
}

@Injectable()
export class WatchlistRepository {
  constructor(
    @InjectRepository(WatchlistItem)
    private readonly watchlistRepository: Repository<WatchlistItem>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async findPageForUser(
    userId: string,
    query: WatchlistQueryDto,
  ): Promise<WatchlistPage> {
    const itemsQuery = this.watchlistRepository
      .createQueryBuilder('watchlistItem')
      .innerJoinAndSelect('watchlistItem.movie', 'movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .select([
        'watchlistItem.id',
        'watchlistItem.userId',
        'watchlistItem.movieId',
        'watchlistItem.addedAt',
        'watchlistItem.watchedAt',
        'movie.id',
        'movie.slug',
        'movie.title',
        'movie.description',
        'movie.releaseDate',
        'movie.runtimeMinutes',
        'movie.posterUrl',
        'genre.id',
        'genre.name',
        'genre.slug',
      ])
      .where('watchlistItem.userId = :userId', { userId });

    if (query.search) {
      itemsQuery.andWhere(
        'STRPOS(LOWER(movie.title), LOWER(:search)) > 0',
        { search: query.search },
      );
    }

    if (query.genre) {
      itemsQuery
        .innerJoin('movie.genres', 'filteredGenre')
        .andWhere('filteredGenre.slug = :genre', { genre: query.genre });
    }

    if (query.release === MovieReleaseFilter.Upcoming) {
      itemsQuery.andWhere('movie.releaseDate >= CURRENT_DATE');
    } else if (query.release === MovieReleaseFilter.Released) {
      itemsQuery.andWhere('movie.releaseDate < CURRENT_DATE');
    }

    this.applySort(itemsQuery, query.sort);
    itemsQuery
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [pageResult, genres] = await Promise.all([
      itemsQuery.getManyAndCount(),
      this.findGenresForUser(userId),
    ]);
    const [items, totalItems] = pageResult;

    return { items, totalItems, genres };
  }

  findMovieBySlug(slug: string): Promise<Movie | null> {
    return this.movieRepository.findOne({
      where: { slug },
      relations: { genres: true },
    });
  }

  findItem(userId: string, movieId: string): Promise<WatchlistItem | null> {
    return this.watchlistRepository.findOne({
      where: { userId, movieId },
      relations: { movie: { genres: true } },
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

  private findGenresForUser(userId: string): Promise<Genre[]> {
    return this.genreRepository
      .createQueryBuilder('genre')
      .innerJoin('genre.movies', 'movie')
      .innerJoin('movie.watchlistItems', 'watchlistItem')
      .select(['genre.id', 'genre.name', 'genre.slug'])
      .where('watchlistItem.userId = :userId', { userId })
      .distinct(true)
      .orderBy('genre.name', 'ASC')
      .getMany();
  }

  private applySort(
    query: SelectQueryBuilder<WatchlistItem>,
    sort: MovieSort,
  ): void {
    if (sort === MovieSort.ReleaseDesc) {
      query
        .orderBy('movie.releaseDate', 'DESC')
        .addOrderBy('movie.title', 'ASC');
    } else if (sort === MovieSort.TitleAsc) {
      query
        .orderBy('movie.title', 'ASC')
        .addOrderBy('movie.releaseDate', 'ASC');
    } else {
      query
        .orderBy('movie.releaseDate', 'ASC')
        .addOrderBy('movie.title', 'ASC');
    }

    query.addOrderBy('watchlistItem.id', 'ASC');
  }
}
