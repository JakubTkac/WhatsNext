import { ApiProperty } from '@nestjs/swagger';

export class LatestReviewAuthorDto {
  @ApiProperty({ example: 'Maya Chen' })
  displayName!: string;

  @ApiProperty({
    example:
      '/api/users/6795ba64-2e00-4f3a-9c9b-547d20de6dcf/avatar',
    nullable: true,
    type: String,
  })
  avatarUrl!: string | null;
}

export class LatestReviewMovieDto {
  @ApiProperty({ example: 'the-odyssey-2026' })
  slug!: string;

  @ApiProperty({ example: 'The Odyssey' })
  title!: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  posterUrl!: string | null;
}

export class LatestReviewDto {
  @ApiProperty({ example: 'd89a2b59-8598-44f7-904e-3d41f9a73a52' })
  id!: string;

  @ApiProperty({ example: 9, minimum: 1, maximum: 10 })
  rating!: number;

  @ApiProperty({
    example:
      'A huge, patient adventure with images that stayed with me after the credits.',
  })
  body!: string;

  @ApiProperty({ example: '2026-07-23T18:42:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: LatestReviewAuthorDto })
  author!: LatestReviewAuthorDto;

  @ApiProperty({ type: LatestReviewMovieDto })
  movie!: LatestReviewMovieDto;
}
