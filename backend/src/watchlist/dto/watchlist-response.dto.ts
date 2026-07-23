import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { GenreSummaryDto } from '../../movies/dto/movie-summary.dto';

export class WatchlistGenreDto {
  @ApiProperty({ example: 'Adventure' })
  name!: string;

  @ApiProperty({ example: 'adventure' })
  slug!: string;
}

export class WatchlistMovieDto {
  @ApiProperty({ example: 'the-odyssey-2026' })
  slug!: string;

  @ApiProperty({ example: 'The Odyssey' })
  title!: string;

  @ApiProperty({ example: 'A legendary journey across dangerous seas.' })
  description!: string;

  @ApiProperty({ example: '2026-07-17', format: 'date' })
  releaseDate!: string;

  @ApiProperty({ example: 148, nullable: true, type: Number })
  runtimeMinutes!: number | null;

  @ApiProperty({ example: null, nullable: true, type: String })
  posterUrl!: string | null;

  @ApiProperty({ type: [WatchlistGenreDto] })
  genres!: WatchlistGenreDto[];
}

export class WatchlistItemDto {
  @ApiProperty({ example: '0ebec190-ce99-458f-ab53-e7b2f09bb16d' })
  id!: string;

  @ApiProperty({ example: '2026-07-23T10:30:00.000Z', format: 'date-time' })
  addedAt!: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  watchedAt!: string | null;

  @ApiProperty({ type: WatchlistMovieDto })
  movie!: WatchlistMovieDto;
}

export class WatchlistResponseDto {
  @ApiProperty({ type: [WatchlistItemDto] })
  items!: WatchlistItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;

  @ApiProperty({
    description: 'Genres available in the authenticated user watchlist.',
    type: [GenreSummaryDto],
  })
  genres!: GenreSummaryDto[];
}
