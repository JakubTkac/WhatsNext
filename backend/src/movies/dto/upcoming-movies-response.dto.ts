import { ApiProperty } from '@nestjs/swagger';
import { MovieSummaryDto } from './movie-summary.dto';

export class UpcomingMoviesResponseDto {
  @ApiProperty({ type: [MovieSummaryDto] })
  items!: MovieSummaryDto[];
}
