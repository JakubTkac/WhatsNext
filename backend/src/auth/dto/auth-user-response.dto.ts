import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: '98a1a2fb-fd6e-4717-a95f-ab083c3d7201' })
  id!: string;

  @ApiProperty({ example: 'email@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: 'Jakub Tkac' })
  displayName!: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  bio!: string | null;

  @ApiProperty({
    example:
      '/api/users/98a1a2fb-fd6e-4717-a95f-ab083c3d7201/avatar',
    nullable: true,
    type: String,
  })
  avatarUrl!: string | null;
}
