import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieSummaryDto } from './dto/movie-summary.dto';
import { UpcomingMoviesQueryDto } from './dto/upcoming-movies-query.dto';
import { UpcomingMoviesResponseDto } from './dto/upcoming-movies-response.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async findUpcoming(
    query: UpcomingMoviesQueryDto,
  ): Promise<UpcomingMoviesResponseDto> {
    const moviesQuery = this.movieRepository
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
      ])
      .where('movie.release_date >= CURRENT_DATE');

    if (query.search) {
      moviesQuery.andWhere('STRPOS(LOWER(movie.title), LOWER(:search)) > 0', {
        search: query.search,
      });
    }

    const movies = await moviesQuery
      .orderBy('movie.releaseDate', 'ASC')
      .addOrderBy('movie.title', 'ASC')
      .take(query.limit)
      .getMany();

    return {
      items: movies.map((movie) => this.toSummary(movie)),
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
