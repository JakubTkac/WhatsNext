import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReviewIdParamDto {
  @ApiProperty({
    example: 'd89a2b59-8598-44f7-904e-3d41f9a73a52',
    format: 'uuid',
  })
  @IsUUID()
  id!: string;
}
