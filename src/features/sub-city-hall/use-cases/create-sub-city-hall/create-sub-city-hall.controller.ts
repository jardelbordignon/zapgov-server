import { extendZodWithOpenApi, generateSchema } from '@anatine/zod-openapi'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodObject, z } from 'zod'

import type { CreateSubCityHallData } from 'src/contracts/sub-city-halls'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { ZodObj, ZodValidationPipe } from 'src/infra/pipes/zod-validation.pipe'

import { SUB_CITY_HALLS_URL } from '../constants'
import { SubCityHallAlreadyExistsError } from '../errors'

import { CreateSubCityHallService } from './create-sub-city-hall.service'

type CreateSubCityHallBodySchema = ZodObject<ZodObj<CreateSubCityHallData>>

extendZodWithOpenApi(z)

const createSubCityHallZodObject = z.object({
  city_hall_id: z.string().uuid(),
  email: z.string().email().openapi({ example: 'subcityhall@email.com' }),
  name: z.string().openapi({ example: 'Some Sub City Hall' }),
  observation: z.string().openapi({ example: 'Some observation' }),
  phone: z.string().openapi({ example: '54 3333 3333' }),
}) as CreateSubCityHallBodySchema

const createSubCityHallOpenApiSchema = generateSchema(createSubCityHallZodObject)

@Controller(SUB_CITY_HALLS_URL)
@UsePipes(new ZodValidationPipe(createSubCityHallZodObject))
export class CreateSubCityHallController {
  constructor(private createSubCityHallService: CreateSubCityHallService) {}

  @ApiTags('SubCityHall')
  @ApiBearerAuth()
  @ApiBody({ schema: createSubCityHallOpenApiSchema as any })
  @ApiResponse({ description: 'Sub city hall registered successful', status: 201 })
  @ApiResponse({
    description: 'When the linked city hall is not found',
    schema: { example: new CityHallNotFoundError() },
    status: 404,
  })
  @ApiResponse({
    description: 'When a sub city hall with same email address already exists',
    schema: { example: new SubCityHallAlreadyExistsError() },
    status: 409,
  })
  @Post()
  async handle(@Body() body: CreateSubCityHallData): Promise<void> {
    const result = await this.createSubCityHallService.execute(body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case CityHallNotFoundError:
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
