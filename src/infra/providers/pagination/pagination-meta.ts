import { ApiProperty } from '@nestjs/swagger'

export class PaginationMetadata {
  @ApiProperty({ example: false })
  hasPrevious: boolean

  @ApiProperty({ example: true })
  hasNext: boolean

  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 1 })
  perPage: number

  @ApiProperty({ example: 10 })
  totalItems: number

  @ApiProperty({ example: 10 })
  totalPages: number
}
