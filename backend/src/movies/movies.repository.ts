import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Genre } from '../genres/entities/genre.entity';
import {
  MovieReleaseFilter,
  MovieSort,
  MoviesQueryDto,
} from './dto/movies-query.dto';
import { UpcomingMoviesQueryDto } from './dto/upcoming-movies-query.dto';
import { Movie } from './entities/movie.entity';

export interface MoviePage {
  items: Movie[];
  totalItems: number;
  genres: Genre[];
}

@Injectable()
export class MoviesRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async findPage(query: MoviesQueryDto): Promise<MoviePage> {
    const moviesQuery = this.createSummaryQuery();

    if (query.search) {
      moviesQuery.andWhere(
        'STRPOS(LOWER(movie.title), LOWER(:search)) > 0',
        { search: query.search },
      );
    }

    if (query.genre) {
      moviesQuery
        .innerJoin('movie.genres', 'filteredGenre')
        .andWhere('filteredGenre.slug = :genre', { genre: query.genre });
    }

    if (query.release === MovieReleaseFilter.Upcoming) {
      moviesQuery.andWhere('movie.releaseDate >= CURRENT_DATE');
    } else if (query.release === MovieReleaseFilter.Released) {
      moviesQuery.andWhere('movie.releaseDate < CURRENT_DATE');
    }

    this.applySort(moviesQuery, query.sort);
    moviesQuery
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [pageResult, genres] = await Promise.all([
      moviesQuery.getManyAndCount(),
      this.genreRepository.find({
        select: { name: true, slug: true },
        order: { name: 'ASC' },
      }),
    ]);
    const [items, totalItems] = pageResult;

    return { items, totalItems, genres };
  }

  findUpcoming(query: UpcomingMoviesQueryDto): Promise<Movie[]> {
    const moviesQuery = this.createSummaryQuery().where(
      'movie.releaseDate >= CURRENT_DATE',
    );

    if (query.search) {
      moviesQuery.andWhere(
        'STRPOS(LOWER(movie.title), LOWER(:search)) > 0',
        { search: query.search },
      );
    }

    return moviesQuery
      .orderBy('movie.releaseDate', 'ASC')
      .addOrderBy('movie.title', 'ASC')
      .addOrderBy('movie.id', 'ASC')
      .take(query.limit)
      .getMany();
  }

  private createSummaryQuery(): SelectQueryBuilder<Movie> {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .select([
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
      ]);
  }

  private applySort(
    query: SelectQueryBuilder<Movie>,
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

    query.addOrderBy('movie.id', 'ASC');
  }
}
