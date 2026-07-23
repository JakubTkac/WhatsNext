import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UserIdParamDto {
  @ApiProperty({
    example: '6795ba64-2e00-4f3a-9c9b-547d20de6dcf',
    format: 'uuid',
  })
  @IsUUID()
  id!: string;
}
