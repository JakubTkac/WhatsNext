import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { GenreSummaryDto, MovieSummaryDto } from './movie-summary.dto';

export class MoviesResponseDto {
  @ApiProperty({ type: [MovieSummaryDto] })
  items!: MovieSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;

  @ApiProperty({
    description: 'Genres available for catalogue filtering.',
    type: [GenreSummaryDto],
  })
  genres!: GenreSummaryDto[];
}
