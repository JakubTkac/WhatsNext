import { ApiProperty } from '@nestjs/swagger';
import { MovieSummaryDto } from './movie-summary.dto';

export class MovieReviewAuthorDto {
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

export class MovieReviewDto {
  @ApiProperty({ example: 'd89a2b59-8598-44f7-904e-3d41f9a73a52' })
  id!: string;

  @ApiProperty({ example: 9, minimum: 1, maximum: 10 })
  rating!: number;

  @ApiProperty({ example: 'A memorable adventure.' })
  body!: string;

  @ApiProperty({ example: '2026-07-23T18:42:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: MovieReviewAuthorDto })
  author!: MovieReviewAuthorDto;
}

export class MovieDetailsResponseDto extends MovieSummaryDto {
  @ApiProperty({ example: 12 })
  reviewCount!: number;

  @ApiProperty({ example: 8.4, nullable: true, type: Number })
  averageRating!: number | null;

  @ApiProperty({ type: [MovieReviewDto] })
  reviews!: MovieReviewDto[];
}
