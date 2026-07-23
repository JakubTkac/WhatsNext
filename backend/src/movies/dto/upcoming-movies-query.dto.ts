import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpcomingMoviesQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of upcoming movies to return.',
    default: 7,
    minimum: 1,
    maximum: 12,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  limit = 7;

  @ApiPropertyOptional({
    description: 'Case-insensitive text to match within the movie title.',
    example: 'Odyssey',
    maxLength: 80,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(80)
  search?: string;
}
