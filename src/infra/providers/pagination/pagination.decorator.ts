import { Type, applyDecorators } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger'

import { PaginatedResponse } from '.'

export { PaginatedResponse }

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
