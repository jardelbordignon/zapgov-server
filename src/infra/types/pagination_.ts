import { Type, applyDecorators } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger'

export class PaginationParams {
  @ApiProperty()
  page: number
  @ApiProperty()
  perPage: number
}

class PaginationMetadata {
  @ApiProperty({ example: false })
  hasPrevious: boolean
  @ApiProperty()
  hasNext: boolean
  @ApiProperty({ example: 1 })
  page: number
  @ApiProperty({ example: 1 })
  perPage: number
  @ApiProperty({ example: 10 })
  total: number
}

export class PaginatedResponse<T> {
  @ApiProperty({ isArray: true })
  data: T[]
  @ApiProperty()
  meta: PaginationMetadata
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  apiResponseOptions?: Omit<ApiResponseOptions, 'isArray' | 'content'>
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResponse<TModel>),
    ApiOkResponse({
      ...apiResponseOptions,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponse) },
          {
            properties: {
              data: {
                items: { $ref: getSchemaPath(model) },
                type: 'array',
              },
            },
          },
        ],
      },
    })
  )
}
