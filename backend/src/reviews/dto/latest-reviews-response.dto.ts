import { ApiProperty } from '@nestjs/swagger';
import { LatestReviewDto } from './latest-review.dto';

export class LatestReviewsResponseDto {
  @ApiProperty({ type: [LatestReviewDto] })
  items!: LatestReviewDto[];
}
