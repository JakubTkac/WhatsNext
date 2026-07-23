import { ApiProperty } from '@nestjs/swagger';

export class GenreSummaryDto {
  @ApiProperty({ example: 'Adventure' })
  name!: string;

  @ApiProperty({ example: 'adventure' })
  slug!: string;
}

export class MovieSummaryDto {
  @ApiProperty({ example: 'avatar-aang-the-last-airbender-2026' })
  slug!: string;

  @ApiProperty({ example: 'Avatar Aang: The Last Airbender' })
  title!: string;

  @ApiProperty({
    example:
      'Avatar Aang and his friends embark on a new journey to protect their world.',
  })
  description!: string;

  @ApiProperty({ example: '2026-07-24', format: 'date' })
  releaseDate!: string;

  @ApiProperty({ example: 99, nullable: true, type: Number })
  runtimeMinutes!: number | null;

  @ApiProperty({ example: null, nullable: true, type: String })
  posterUrl!: string | null;

  @ApiProperty({ type: [GenreSummaryDto] })
  genres!: GenreSummaryDto[];
}
