import {
  ExecutionContext,
  Type,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger'

export class PaginationParams {
  @ApiProperty({ example: 'no' })
  deleted?: 'yes' | 'no' = 'no'

  @ApiProperty({ example: '1' })
  page?: string = '1'

  @ApiProperty({ example: '20' })
  perPage?: string = '20'

  @ApiProperty({ example: 'name,slug=data,data-x,abc' })
  filter?: string
}

class PaginationMetadata {
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

export class PaginatedResponse<T> {
  @ApiProperty({ isArray: true })
  data: T[] = []

  @ApiProperty()
  meta: PaginationMetadata = new PaginationMetadata()
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
        title: `PaginatedResponse of ${model.name}`,
      },
    })
  )
}

export const PaginationQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return {
      deleted: request.query.deleted,
      filter: request.query.filter,
      page: request.query.page,
      perPage: request.query.perPage,
    } as PaginationParams
  }
)

export * from './pagers/in-memory-paginator'
export * from './pagers/prisma-paginator'
