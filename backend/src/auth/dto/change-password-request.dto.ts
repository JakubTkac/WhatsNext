import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsString, Matches } from 'class-validator';

export class ChangePasswordRequestDto {
  @ApiProperty({ example: 'password123', format: 'password' })
  @IsString()
  @IsByteLength(1, 72)
  currentPassword!: string;

  @ApiProperty({
    example: 'newPassword456',
    format: 'password',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @IsByteLength(8, 72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'newPassword must contain at least one letter and one number',
  })
  newPassword!: string;
}
