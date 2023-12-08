import { extendZodWithOpenApi, generateSchema } from '@anatine/zod-openapi'
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodObject, z } from 'zod'

import type { CreateCityHallData } from 'src/contracts/city-halls'
import { AllowUnauthenticated } from 'src/infra/auth/authentication.guard'
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
  title: z.string().openapi({ example: 'Ayuntamiento de Tangamandapio' }),
  txt_color: z.string().regex(hexColorRegex).openapi({ example: '#222222' }),
}) as CreateCityHallBodySchema

const createCityHallOpenApiSchema = generateSchema(createCityHallZodObject)

@Controller(CITY_HALLS_URL)
@AllowUnauthenticated()
@UsePipes(new ZodValidationPipe(createCityHallZodObject))
export class CreateCityHallController {
  constructor(private createCityHallService: CreateCityHallService) {}

  @ApiTags('CityHall')
  @ApiBody({ schema: createCityHallOpenApiSchema as any })
  @ApiResponse({ description: 'City hall registered successful', status: 201 })
  @ApiResponse({
    description: `When a city hall with same email address already exists <br/>
    When a city hall with same slug already exists
    `,
    status: 401,
  })
  @Post()
  async handle(@Body() body: CreateCityHallData): Promise<void> {
    const result = await this.createCityHallService.execute(body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case CityHallAlreadyExistsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
