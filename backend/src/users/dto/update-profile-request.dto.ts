import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  AVATAR_DATA_URL_PATTERN,
  MAX_AVATAR_DATA_URL_LENGTH,
} from '../avatar-data';

export class UpdateProfileRequestDto {
  @ApiPropertyOptional({ example: 'Jakub Tkac', minLength: 2, maxLength: 100 })
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'email@example.com',
    format: 'email',
    maxLength: 254,
  })
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({
    example: 'Movie fan and occasional reviewer.',
    maxLength: 500,
    nullable: true,
    type: String,
  })
  @IsOptional()
  @Transform(trimNullableString)
  @IsString()
  @MaxLength(500)
  bio?: string | null;

  @ApiPropertyOptional({
    description:
      'PNG, JPEG, or WebP data URL. Send null to remove the current avatar.',
    nullable: true,
    maxLength: MAX_AVATAR_DATA_URL_LENGTH,
    pattern: AVATAR_DATA_URL_PATTERN.source,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_AVATAR_DATA_URL_LENGTH)
  @Matches(AVATAR_DATA_URL_PATTERN, {
    message: 'avatarDataUrl must contain a PNG, JPEG, or WebP image',
  })
  avatarDataUrl?: string | null;
}

function normalizeEmail({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function trimNullableString({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
