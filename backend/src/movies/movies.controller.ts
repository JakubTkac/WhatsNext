import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { MoviesQueryDto } from './dto/movies-query.dto';
import { MoviesResponseDto } from './dto/movies-response.dto';
import { UpcomingMoviesQueryDto } from './dto/upcoming-movies-query.dto';
import { UpcomingMoviesResponseDto } from './dto/upcoming-movies-response.dto';
import { MoviesService } from './movies.service';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Browse the movie catalogue',
    description:
      'Returns a paginated movie catalogue with title, genre, release-status, and sorting filters.',
  })
  @ApiOkResponse({
    description: 'Movie page returned successfully.',
    type: MoviesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'One or more movie filters failed validation.',
  })
  findAll(@Query() query: MoviesQueryDto): Promise<MoviesResponseDto> {
    return this.moviesService.findAll(query);
  }

  @Public()
  @Get('upcoming')
  @ApiOperation({
    summary: 'Get upcoming movie releases',
    description:
      'Returns movies releasing today or later, optionally filtered by title, ordered by release date and title.',
  })
  @ApiOkResponse({
    description: 'Upcoming movies returned successfully.',
    type: UpcomingMoviesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The requested limit or search value failed query validation.',
  })
  findUpcoming(
    @Query() query: UpcomingMoviesQueryDto,
  ): Promise<UpcomingMoviesResponseDto> {
    return this.moviesService.findUpcoming(query);
  }
}
