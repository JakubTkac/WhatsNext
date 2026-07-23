import { ApiProperty } from '@nestjs/swagger';
import { AuthUserResponseDto } from './auth-user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'Bearer access token.' })
  accessToken!: string;

  @ApiProperty({
    description: 'Access-token lifetime in seconds.',
    example: 86400,
  })
  expiresIn!: number;

  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;
}
