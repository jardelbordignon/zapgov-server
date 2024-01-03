import { extendZodWithOpenApi, generateSchema } from '@anatine/zod-openapi'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Put,
  UsePipes,
  //UsePipes,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodObject, z } from 'zod'

import type { UpdateCityHallData } from 'src/contracts/city-halls'
import {
  ZodObj,
  ZodValidationError,
  ZodValidationPipe,
  //ZodValidationPipe,
} from 'src/infra/pipes/zod-validation.pipe'
import {
  File,
  FileInterceptor,
} from 'src/infra/providers/file-storage/file-storage.decorators'

import { CityHallEntity } from '../../city-hall.entity'
import { CITY_HALLS_URL } from '../../shared/constants'
import { CityHallAlreadyExistsError, CityHallNotFoundError } from '../errors'

import { UpdateCityHallService } from './update-city-hall.service'

type UpdateCityHallBodySchema = ZodObject<ZodObj<UpdateCityHallData>>

extendZodWithOpenApi(z)

const updateCityHallZodObject = z.object({
  deleted_at: z.date().optional().nullable(),
  email: z.string().email().optional().openapi({ example: 'city-hall-x@email.com' }),
  name: z.string().optional().openapi({ example: 'City Hall X' }),
  phone: z.string().optional().openapi({ example: '54 3333 3333' }),
  slug: z.string().optional().openapi({ example: 'city_hall_x' }),
  txt_color: z.string().optional().openapi({ example: '#f2f2f2' }),
}) as UpdateCityHallBodySchema

const updateCityHallOpenApiSchema = generateSchema(updateCityHallZodObject)

@Controller(CITY_HALLS_URL)
export class UpdateCityHallController {
  constructor(private updateCityHallService: UpdateCityHallService) {}
  @ApiTags('CityHall')
  @ApiBearerAuth()
  @ApiBody({ schema: updateCityHallOpenApiSchema as any })
  @ApiResponse({
    description: 'CityHall updated successful',
    status: 200,
    type: CityHallEntity,
  })
  @ApiResponse({
    description: 'When the input data is invalid',
    schema: { example: ZodValidationError.example() },
    status: 400,
  })
  @ApiResponse({
    description: 'When city hall not found',
    schema: { example: new CityHallNotFoundError() },
    status: 404,
  })
  @ApiResponse({
    description: `When a city hall with same email address already exists <br/>
    When a city hall with same slug already exists`,
    schema: { example: new CityHallAlreadyExistsError() },
    status: 409,
  })
  @FileInterceptor()
  @UsePipes(new ZodValidationPipe(updateCityHallZodObject))
  @Put('/:id')
  async handleUpdateByCityHallId(
    @Param('id') cityHallId: string,
    @Body() body: UpdateCityHallData,
    @File({ maxMB: 1, nullable: true }) file?: Express.Multer.File
  ): Promise<CityHallEntity> {
    const result = await this.updateCityHallService.execute(cityHallId, body, file)

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
