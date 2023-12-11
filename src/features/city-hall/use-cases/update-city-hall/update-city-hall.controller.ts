import { extendZodWithOpenApi, generateSchema } from '@anatine/zod-openapi'
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
import { Role } from '@prisma/client'
import { ZodObject, z } from 'zod'

import type { UpdateCityHallData } from 'src/contracts/city-halls'
import { ZodObj } from 'src/infra/pipes/zod-validation.pipe'

import { CityHallEntity } from '../../city-hall.entity'
import { CITY_HALLS_URL } from '../constants'
import { CityHallAlreadyExistsError, CityHallNotFoundError } from '../errors'

import { UpdateCityHallService } from './update-city-hall.service'

type UpdateCityHallBodySchema = ZodObject<ZodObj<UpdateCityHallData>>

extendZodWithOpenApi(z)

const updateCityHallZodObject = z.object({
  currentPassword: z.string().optional().openapi({ example: 'Pwd@123' }),
  email: z.string().email().optional().openapi({ example: 'johndoe@email.com' }),
  name: z.string().optional().openapi({ example: 'Updated John Doe' }),
  password: z.string().optional().openapi({ example: 'UpdatedPwd@123' }),
  roles: z.array(z.nativeEnum(Role)).optional(),
}) as UpdateCityHallBodySchema

// const updateCityHallValidationPipe = new ZodValidationPipe(
//   updateCityHallZodObject.superRefine(({ currentPassword, email, password }, ctx) => {
//     if ((email || password) && !currentPassword) {
//       ctx.addIssue({
//         code: 'custom',
//         message: 'currentPassword if required to update email or password',
//         path: ['currentPassword'],
//       })
//     }
//   })
// )

const createCityHallOpenApiSchema = generateSchema(updateCityHallZodObject)

function UpdateCityHallApiDecorators() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiBody({ schema: createCityHallOpenApiSchema as any }),
    ApiResponse({
      description: 'CityHall updated successful',
      status: 200,
      type: CityHallEntity,
    }),
    ApiResponse({
      description: 'When city hall not found',
      schema: { example: new CityHallNotFoundError() },
      status: 404,
    }),
    ApiResponse({
      description: `When a city hall with same email address already exists <br/>
      When a city hall with same slug already exists`,
      schema: { example: new CityHallAlreadyExistsError() },
      status: 409,
    })
  )
}

@ApiTags('CityHall')
@Controller(CITY_HALLS_URL)
//@UsePipes(updateCityHallValidationPipe)
export class UpdateCityHallController {
  constructor(private updateCityHallService: UpdateCityHallService) {}

  @UpdateCityHallApiDecorators()
  @Put('/:id')
  async handleUpdateByCityHallId(
    @Param('id') cityHallId: string,
    @Body() body: UpdateCityHallData
  ): Promise<CityHallEntity> {
    const result = await this.updateCityHallService.execute(cityHallId, body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case CityHallNotFoundError:
          throw new NotFoundException(error.message)
        case CityHallAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
