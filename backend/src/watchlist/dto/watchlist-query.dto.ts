import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  MovieReleaseFilter,
  MovieSort,
} from '../../movies/dto/movies-query.dto';

export class WatchlistQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    default: 12,
    minimum: 1,
    maximum: 500,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit = 12;

  @ApiPropertyOptional({
    description: 'Case-insensitive text to match within the movie title.',
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

  @ApiPropertyOptional({
    description: 'Genre slug to filter by.',
    example: 'science-fiction',
    maxLength: 100,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MaxLength(100)
  genre?: string;

  @ApiPropertyOptional({
    enum: MovieReleaseFilter,
    default: MovieReleaseFilter.All,
  })
  @IsOptional()
  @IsEnum(MovieReleaseFilter)
  release = MovieReleaseFilter.All;

  @ApiPropertyOptional({
    enum: MovieSort,
    default: MovieSort.ReleaseAsc,
  })
  @IsOptional()
  @IsEnum(MovieSort)
  sort = MovieSort.ReleaseAsc;
}
