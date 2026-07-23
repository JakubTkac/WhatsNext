import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { LatestReviewDto } from './latest-review.dto';

export class ReviewsResponseDto {
  @ApiProperty({ type: [LatestReviewDto] })
  items!: LatestReviewDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
