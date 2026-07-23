import { ApiProperty } from '@nestjs/swagger';

export class ApiInfoResponseDto {
  @ApiProperty({ example: 'WhatsNext API' })
  name!: string;

  @ApiProperty({ example: '1.0.0' })
  version!: string;
}

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  status!: 'ok';

  @ApiProperty({ enum: ['up'], example: 'up' })
  database!: 'up';
}
