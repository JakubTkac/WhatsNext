import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class LatestReviewsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of recent reviews to return.',
    default: 6,
    minimum: 1,
    maximum: 12,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  limit = 6;
}
