import { ApiProperty } from '@nestjs/swagger';

export class WatchlistMovieDto {
  @ApiProperty({ example: 'the-odyssey-2026' })
  slug!: string;

  @ApiProperty({ example: 'The Odyssey' })
  title!: string;

  @ApiProperty({ example: '2026-07-17', format: 'date' })
  releaseDate!: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  posterUrl!: string | null;
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
}
