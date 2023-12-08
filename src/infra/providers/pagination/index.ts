import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetadata } from './pagination-meta'

export class PaginatedResponse<T> {
  @ApiProperty({ isArray: true })
  data: T[]

  @ApiProperty()
  meta: PaginationMetadata
}

export * from './pagination-params'
