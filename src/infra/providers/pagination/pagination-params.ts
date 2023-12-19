import { ApiProperty } from '@nestjs/swagger'

export class PaginationParams {
  @ApiProperty({ example: 1 })
  page: number = 1

  @ApiProperty({ example: 10 })
  perPage: number = 20

  @ApiProperty({ example: 'john' })
  searchTerm?: string
}
