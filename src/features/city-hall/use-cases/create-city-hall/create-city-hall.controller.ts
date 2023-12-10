import { extendZodWithOpenApi, generateSchema } from '@anatine/zod-openapi'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodObject, z } from 'zod'

import type { CreateCityHallData } from 'src/contracts/city-halls'
import { ZodObj, ZodValidationPipe } from 'src/infra/pipes/zod-validation.pipe'

import { CITY_HALLS_URL } from '../constants'
import { CityHallAlreadyExistsError } from '../errors'

import { CreateCityHallService } from './create-city-hall.service'

type CreateCityHallBodySchema = ZodObject<ZodObj<CreateCityHallData>>

extendZodWithOpenApi(z)

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

const createCityHallZodObject = z.object({
  bg_image: z.string().regex(hexColorRegex).openapi({ example: '#f2f2f2' }),
  email: z
    .string()
    .email()
    .openapi({ example: 'tangamandapio.ayuntamiento@email.com' }),
  name: z.string().openapi({ example: 'Ayuntamiento de Tangamandapio' }),
  phone: z.string().openapi({ example: '01 (383) 518 32 57' }),
  slug: z.string().openapi({ example: 'tangamandapio' }),
  txt_color: z.string().regex(hexColorRegex).openapi({ example: '#222222' }),
}) as CreateCityHallBodySchema

const createCityHallOpenApiSchema = generateSchema(createCityHallZodObject)

@Controller(CITY_HALLS_URL)
@UsePipes(new ZodValidationPipe(createCityHallZodObject))
export class CreateCityHallController {
  constructor(private createCityHallService: CreateCityHallService) {}

  @ApiTags('CityHall')
  @ApiBearerAuth()
  @ApiBody({ schema: createCityHallOpenApiSchema as any })
  @ApiResponse({ description: 'City hall registered successful', status: 201 })
  @ApiResponse({
    description: `When a city hall with same email address already exists <br/>
    When a city hall with same slug already exists
    `,
    schema: { example: new CityHallAlreadyExistsError() },
    status: 409,
  })
  @Post()
  async handle(@Body() body: CreateCityHallData): Promise<void> {
    const result = await this.createCityHallService.execute(body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case CityHallAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
