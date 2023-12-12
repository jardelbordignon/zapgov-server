import { generateSchema } from '@anatine/zod-openapi'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Put,
  applyDecorators,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodObject, z } from 'zod'

import type { UpdateNeighborhoodData } from 'src/contracts/neighborhoods'
import { ZodObj } from 'src/infra/pipes/zod-validation.pipe'

import { NeighborhoodEntity } from '../../neighborhood.entity'
import { NEIGHBORHOODS_URL } from '../constants'
import { NeighborhoodAlreadyExistsError, NeighborhoodNotFoundError } from '../errors'

import { UpdateNeighborhoodService } from './update-neighborhood.service'

type UpdateNeighborhoodBodySchema = ZodObject<ZodObj<UpdateNeighborhoodData>>

// extendZodWithOpenApi(z)

const updateNeighborhoodZodObject = z.object({
  deleted_at: z.date().optional(),
  email: z.string().email().optional().openapi({ example: 'johndoe@email.com' }),
  name: z.string().optional().openapi({ example: 'Sub City Hall X' }),
  observation: z.string().optional().openapi({ example: 'Some observation' }),
  phone: z.string().optional().openapi({ example: '54 3333 3333' }),
}) as UpdateNeighborhoodBodySchema

// const updateNeighborhoodValidationPipe = new ZodValidationPipe(
//   updateNeighborhoodZodObject.superRefine(({ currentPassword, email, password }, ctx) => {
//     if ((email || password) && !currentPassword) {
//       ctx.addIssue({
//         code: 'custom',
//         message: 'currentPassword if required to update email or password',
//         path: ['currentPassword'],
//       })
//     }
//   })
// )

const createNeighborhoodOpenApiSchema = generateSchema(updateNeighborhoodZodObject)

function UpdateNeighborhoodApiDecorators() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiBody({ schema: createNeighborhoodOpenApiSchema as any }),
    ApiResponse({
      description: 'Sub city hall updated successful',
      status: 200,
      type: NeighborhoodEntity,
    }),
    ApiResponse({
      description: 'When a neighborhood is not found',
      schema: { example: new NeighborhoodNotFoundError() },
      status: 404,
    }),
    ApiResponse({
      description: 'When a neighborhood with same email address already exists',
      schema: { example: new NeighborhoodAlreadyExistsError() },
      status: 409,
    })
  )
}

@ApiTags('Neighborhood')
@Controller(NEIGHBORHOODS_URL)
//@UsePipes(updateNeighborhoodValidationPipe)
export class UpdateNeighborhoodController {
  constructor(private updateNeighborhoodService: UpdateNeighborhoodService) {}

  @UpdateNeighborhoodApiDecorators()
  @Put('/:id')
  async handleUpdateByNeighborhoodId(
    @Param('id') neighborhoodId: string,
    @Body() body: UpdateNeighborhoodData
  ): Promise<NeighborhoodEntity> {
    const result = await this.updateNeighborhoodService.execute(neighborhoodId, body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case NeighborhoodNotFoundError:
          throw new NotFoundException(error.message)
        case NeighborhoodAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
