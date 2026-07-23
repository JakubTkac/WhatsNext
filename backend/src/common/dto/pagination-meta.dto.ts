import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1, minimum: 1 })
  page!: number;

  @ApiProperty({ example: 12, minimum: 1 })
  limit!: number;

  @ApiProperty({ example: 34, minimum: 0 })
  totalItems!: number;

  @ApiProperty({ example: 3, minimum: 0 })
  totalPages!: number;
}
