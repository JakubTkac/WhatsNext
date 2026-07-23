import { ApiProperty } from '@nestjs/swagger';

export class ProfileStatsDto {
  @ApiProperty({ example: 4 })
  watchlistCount!: number;

  @ApiProperty({ example: 2 })
  reviewCount!: number;
}

export class ProfileGenreDto {
  @ApiProperty({ example: 'Science Fiction' })
  name!: string;

  @ApiProperty({ example: 'science-fiction' })
  slug!: string;
}

export class ProfileMovieDto {
  @ApiProperty({ example: 'the-odyssey-2026' })
  slug!: string;

  @ApiProperty({ example: 'The Odyssey' })
  title!: string;

  @ApiProperty({ example: '2026-07-17', format: 'date' })
  releaseDate!: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  posterUrl!: string | null;

  @ApiProperty({ example: 148, nullable: true, type: Number })
  runtimeMinutes!: number | null;

  @ApiProperty({ type: [ProfileGenreDto] })
  genres!: ProfileGenreDto[];
}

export class ProfileReviewDto {
  @ApiProperty({ example: 'd89a2b59-8598-44f7-904e-3d41f9a73a52' })
  id!: string;

  @ApiProperty({ example: 9, minimum: 1, maximum: 10 })
  rating!: number;

  @ApiProperty({ example: 'A memorable adventure.' })
  body!: string;

  @ApiProperty({ example: '2026-07-23T18:42:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: ProfileMovieDto })
  movie!: ProfileMovieDto;
}

export class ProfileWatchlistItemDto {
  @ApiProperty({ example: '0ebec190-ce99-458f-ab53-e7b2f09bb16d' })
  id!: string;

  @ApiProperty({ example: '2026-07-20T10:30:00.000Z', format: 'date-time' })
  addedAt!: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  watchedAt!: string | null;

  @ApiProperty({ type: ProfileMovieDto })
  movie!: ProfileMovieDto;
}

export class ProfileResponseDto {
  @ApiProperty({ example: '98a1a2fb-fd6e-4717-a95f-ab083c3d7201' })
  id!: string;

  @ApiProperty({ example: 'email@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: 'Jakub Tkac' })
  displayName!: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  bio!: string | null;

  @ApiProperty({ example: null, nullable: true, type: String })
  avatarUrl!: string | null;

  @ApiProperty({ example: '2026-07-23T18:42:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: ProfileStatsDto })
  stats!: ProfileStatsDto;

  @ApiProperty({ type: [ProfileReviewDto] })
  recentReviews!: ProfileReviewDto[];

  @ApiProperty({
    type: [ProfileWatchlistItemDto],
    description:
      'Up to four upcoming watchlist movies ordered by release date.',
  })
  watchlistPreview!: ProfileWatchlistItemDto[];
}
