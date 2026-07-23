import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReviewRequestDto {
  @ApiProperty({ example: 'the-odyssey-2026', maxLength: 255 })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  movieSlug!: string;

  @ApiProperty({ example: 9, minimum: 1, maximum: 10, type: Number })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  rating!: number;

  @ApiProperty({
    example:
      'A huge, patient adventure with images that stayed with me after the credits.',
    minLength: 10,
    maxLength: 2000,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  body!: string;
}
