import { ApiProperty } from '@nestjs/swagger';

export class EligibleReviewMovieDto {
  @ApiProperty({ example: 'the-odyssey-2026' })
  slug!: string;

  @ApiProperty({ example: 'The Odyssey' })
  title!: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  posterUrl!: string | null;
}

export class EligibleReviewMoviesResponseDto {
  @ApiProperty({ type: [EligibleReviewMovieDto] })
  items!: EligibleReviewMovieDto[];
}
