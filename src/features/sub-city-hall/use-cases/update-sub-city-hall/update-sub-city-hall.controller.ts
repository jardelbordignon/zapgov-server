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

import type { UpdateSubCityHallData } from 'src/contracts/sub-city-halls'
import { ZodObj } from 'src/infra/pipes/zod-validation.pipe'

import { SubCityHallEntity } from '../../sub-city-hall.entity'
import { SUB_CITY_HALLS_URL } from '../../shared/constants'
import { SubCityHallAlreadyExistsError, SubCityHallNotFoundError } from '../errors'

import { UpdateSubCityHallService } from './update-sub-city-hall.service'

type UpdateSubCityHallBodySchema = ZodObject<ZodObj<UpdateSubCityHallData>>

// extendZodWithOpenApi(z)

const updateSubCityHallZodObject = z.object({
  deleted_at: z.date().optional(),
  email: z.string().email().optional().openapi({ example: 'johndoe@email.com' }),
  name: z.string().optional().openapi({ example: 'Sub City Hall X' }),
  observation: z.string().optional().openapi({ example: 'Some observation' }),
  phone: z.string().optional().openapi({ example: '54 3333 3333' }),
}) as UpdateSubCityHallBodySchema

// const updateSubCityHallValidationPipe = new ZodValidationPipe(
//   updateSubCityHallZodObject.superRefine(({ currentPassword, email, password }, ctx) => {
//     if ((email || password) && !currentPassword) {
//       ctx.addIssue({
//         code: 'custom',
//         message: 'currentPassword if required to update email or password',
//         path: ['currentPassword'],
//       })
//     }
//   })
// )

const createSubCityHallOpenApiSchema = generateSchema(updateSubCityHallZodObject)

function UpdateSubCityHallApiDecorators() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiBody({ schema: createSubCityHallOpenApiSchema as any }),
    ApiResponse({
      description: 'Sub city hall updated successful',
      status: 200,
      type: SubCityHallEntity,
    }),
    ApiResponse({
      description: 'When a sub city hall is not found',
      schema: { example: new SubCityHallNotFoundError() },
      status: 404,
    }),
    ApiResponse({
      description: 'When a sub city hall with same email address already exists',
      schema: { example: new SubCityHallAlreadyExistsError() },
      status: 409,
    })
  )
}

@ApiTags('SubCityHall')
@Controller(SUB_CITY_HALLS_URL)
//@UsePipes(updateSubCityHallValidationPipe)
export class UpdateSubCityHallController {
  constructor(private updateSubCityHallService: UpdateSubCityHallService) {}

  @UpdateSubCityHallApiDecorators()
  @Put('/:id')
  async handleUpdateBySubCityHallId(
    @Param('id') cityHallId: string,
    @Body() body: UpdateSubCityHallData
  ): Promise<SubCityHallEntity> {
    const result = await this.updateSubCityHallService.execute(cityHallId, body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case SubCityHallNotFoundError:
          throw new NotFoundException(error.message)
        case SubCityHallAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
