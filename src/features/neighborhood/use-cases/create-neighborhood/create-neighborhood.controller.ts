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

import type { CreateNeighborhoodData } from 'src/contracts/neighborhoods'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { SubCityHallNotFoundError } from 'src/features/sub-city-hall/use-cases/errors'
import {
  ZodObj,
  ZodValidationError,
  ZodValidationPipe,
} from 'src/infra/pipes/zod-validation.pipe'

import { NEIGHBORHOODS_URL } from '../../shared/constants'
import { NeighborhoodAlreadyExistsError } from '../errors'

import { CreateNeighborhoodService } from './create-neighborhood.service'

type CreateNeighborhoodBodySchema = ZodObject<ZodObj<CreateNeighborhoodData>>

extendZodWithOpenApi(z)

const createNeighborhoodZodObject = z.object({
  cep: z.string().openapi({ example: '99999-999' }),
  city_hall_id: z.string().uuid(),
  locality: z.string().openapi({ example: 'Some locality' }),
  name: z.string().openapi({ example: 'Happy Neighborhood' }),
  observation: z.string().openapi({ example: 'Some observation' }),
  sub_city_hall_id: z.string().uuid(),
}) as CreateNeighborhoodBodySchema

const createNeighborhoodOpenApiSchema = generateSchema(createNeighborhoodZodObject)

@Controller(NEIGHBORHOODS_URL)
@UsePipes(new ZodValidationPipe(createNeighborhoodZodObject))
export class CreateNeighborhoodController {
  constructor(private createNeighborhoodService: CreateNeighborhoodService) {}

  @ApiTags('Neighborhood')
  @ApiBearerAuth()
  @ApiBody({ schema: createNeighborhoodOpenApiSchema as any })
  @ApiResponse({ description: 'Neighborhood registered successful', status: 201 })
  @ApiResponse({
    description: 'When the input data is invalid',
    schema: { example: ZodValidationError.example('name') },
    status: 400,
  })
  @ApiResponse({
    description: 'When the linked city hall or sub city hall is not found',
    schema: { example: new CityHallNotFoundError() },
    status: 404,
  })
  @ApiResponse({
    description:
      'When a neighborhood with same name already exists in the sub city hall',
    schema: { example: new NeighborhoodAlreadyExistsError() },
    status: 409,
  })
  @Post()
  async handle(@Body() body: CreateNeighborhoodData): Promise<void> {
    const result = await this.createNeighborhoodService.execute(body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case CityHallNotFoundError:
          throw new NotFoundException(error.message)
        case SubCityHallNotFoundError:
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
