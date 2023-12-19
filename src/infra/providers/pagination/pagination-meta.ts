import { ApiProperty } from '@nestjs/swagger'

export class PaginationMetadata {
  @ApiProperty({ example: false })
  hasPrevious: boolean = false

  @ApiProperty({ example: true })
  hasNext: boolean = false

  @ApiProperty({ example: 1 })
  page: number = 0

  @ApiProperty({ example: 1 })
  perPage: number = 0

  @ApiProperty({ example: 10 })
  totalItems: number = 0

  @ApiProperty({ example: 10 })
  totalPages: number = 0
}
