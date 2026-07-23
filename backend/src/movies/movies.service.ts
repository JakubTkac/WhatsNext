import { Injectable } from '@nestjs/common';
import { MovieSummaryDto } from './dto/movie-summary.dto';
import { MoviesQueryDto } from './dto/movies-query.dto';
import { MoviesResponseDto } from './dto/movies-response.dto';
import { UpcomingMoviesQueryDto } from './dto/upcoming-movies-query.dto';
import { UpcomingMoviesResponseDto } from './dto/upcoming-movies-response.dto';
import { Movie } from './entities/movie.entity';
import { MoviesRepository } from './movies.repository';

@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) {}

  async findAll(query: MoviesQueryDto): Promise<MoviesResponseDto> {
    const page = await this.moviesRepository.findPage(query);

    return {
      items: page.items.map((movie) => this.toSummary(movie)),
      meta: {
        page: query.page,
        limit: query.limit,
        totalItems: page.totalItems,
        totalPages: Math.ceil(page.totalItems / query.limit),
      },
      genres: page.genres.map((genre) => ({
        name: genre.name,
        slug: genre.slug,
      })),
    };
  }

  async findUpcoming(
    query: UpcomingMoviesQueryDto,
  ): Promise<UpcomingMoviesResponseDto> {
    const movies = await this.moviesRepository.findUpcoming(query);

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
