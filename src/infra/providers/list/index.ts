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

export class ListParams {
  @ApiProperty({ example: 'photos,comments' })
  add?: string

  @ApiProperty({ example: 'no' })
  addDeleted?: 'yes' | 'no' = 'no'

  @ApiProperty({ example: 'no' })
  deleted?: 'yes' | 'no' = 'no'

  @ApiProperty({ example: 'name,slug=data,data-x,abc' })
  filter?: string

  @ApiProperty({ example: 'name.desc' })
  order?: string

  @ApiProperty({ example: '1' })
  page?: string = '1'

  @ApiProperty({ example: '20' })
  perPage?: string = '20'
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

export class ListResponse<T> {
  @ApiProperty({ isArray: true })
  data: T[] = []

  @ApiProperty()
  meta: PaginationMetadata = new PaginationMetadata()
}

export const ApiListResponse = <TModel extends Type<any>>(
  model: TModel,
  apiResponseOptions?: Omit<ApiResponseOptions, 'isArray' | 'content'>
) => {
  return applyDecorators(
    ApiExtraModels(ListResponse<TModel>),
    ApiOkResponse({
      ...apiResponseOptions,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ListResponse) },
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

export const ListQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return {
      add: request.query.add,
      addDeleted: request.query.addDeleted,
      deleted: request.query.deleted,
      filter: request.query.filter,
      order: request.query.order,
      page: request.query.page,
      perPage: request.query.perPage,
    } as ListParams
  }
)

export * from './implementations/in-memory-list'
export * from './implementations/prisma-list'
