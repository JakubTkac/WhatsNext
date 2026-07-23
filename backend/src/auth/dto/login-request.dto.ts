import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsByteLength, IsEmail, IsString, MaxLength } from 'class-validator';
import { normalizeEmail } from './auth-dto.transforms';

export class LoginRequestDto {
  @ApiProperty({
    example: 'user123@example.com',
    format: 'email',
    maxLength: 254,
  })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'password123', format: 'password' })
  @IsString()
  @IsByteLength(1, 72)
  password!: string;
}
