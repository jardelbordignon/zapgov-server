import { ApiProperty } from '@nestjs/swagger'

export class PaginationParams {
  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 10 })
  perPage: number
}
