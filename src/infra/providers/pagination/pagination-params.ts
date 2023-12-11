import { ApiProperty } from '@nestjs/swagger'

export class PaginationParams {
  @ApiProperty({ example: 1, nullable: true })
  page: number

  @ApiProperty({ example: 10, nullable: true })
  perPage: number

  @ApiProperty({ example: 'john', nullable: true })
  searchTerm?: string
}
