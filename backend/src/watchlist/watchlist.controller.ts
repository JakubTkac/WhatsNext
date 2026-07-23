import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { MovieSlugParamDto } from './dto/movie-slug-param.dto';
import {
  WatchlistItemDto,
  WatchlistResponseDto,
} from './dto/watchlist-response.dto';
import { WatchlistService } from './watchlist.service';

@ApiTags('watchlist')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'Access token is missing or invalid.',
})
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user watchlist' })
  @ApiOkResponse({
    description: 'Watchlist returned successfully.',
    type: WatchlistResponseDto,
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WatchlistResponseDto> {
    return this.watchlistService.findAll(user.id);
  }

  @Put(':movieSlug')
  @ApiOperation({
    summary: 'Add a movie to the authenticated user watchlist',
    description:
      'This operation is idempotent and returns the existing item when the movie is already saved.',
  })
  @ApiOkResponse({
    description: 'Movie is in the watchlist.',
    type: WatchlistItemDto,
  })
  @ApiBadRequestResponse({ description: 'Movie slug is invalid.' })
  @ApiNotFoundResponse({ description: 'Movie not found.' })
  add(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: MovieSlugParamDto,
  ): Promise<WatchlistItemDto> {
    return this.watchlistService.add(user.id, params.movieSlug);
  }

  @Delete(':movieSlug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a movie from the authenticated user watchlist',
    description:
      'Removing a missing watchlist item is treated as a successful no-op.',
  })
  @ApiNoContentResponse({
    description: 'Movie is no longer in the watchlist.',
  })
  @ApiBadRequestResponse({ description: 'Movie slug is invalid.' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: MovieSlugParamDto,
  ): Promise<void> {
    return this.watchlistService.remove(user.id, params.movieSlug);
  }
}
