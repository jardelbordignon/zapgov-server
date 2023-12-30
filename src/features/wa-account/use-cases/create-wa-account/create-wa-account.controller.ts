import { randomUUID } from 'node:crypto'

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
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodObject, z } from 'zod'

import type { CreateWaAccountData } from 'src/contracts/wa-account'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import {
  ZodObj,
  ZodValidationError,
  ZodValidationPipe,
} from 'src/infra/pipes/zod-validation.pipe'

import { WA_ACCOUNT_URL } from '../../shared/constants'
import { WaAccountAlreadyExistsError } from '../errors'

import { CreateWaAccountService } from './create-wa-account.service'

type CreateWaAccountBodySchema = ZodObject<ZodObj<CreateWaAccountData>>

extendZodWithOpenApi(z)

const createWaAccountZodObject = z.object({
  acronym: z.string().openapi({ example: 'HS1' }),
  city_hall_id: z.string().uuid().openapi({ example: randomUUID() }),
  phone: z.string().openapi({ example: '51 99999999' }),
}) as CreateWaAccountBodySchema

const createWaAccountOpenApiSchema = generateSchema(createWaAccountZodObject)

@Controller(WA_ACCOUNT_URL)
@UsePipes(new ZodValidationPipe(createWaAccountZodObject))
export class CreateWaAccountController {
  constructor(private service: CreateWaAccountService) {}

  @ApiTags('WaAccount')
  @ApiBody({ schema: createWaAccountOpenApiSchema as any })
  @ApiResponse({ description: 'WaAccount created successful', status: 201 })
  @ApiResponse({
    description: 'When the input data is invalid',
    schema: { example: ZodValidationError.example('acronym') },
    status: 400,
  })
  @ApiResponse({
    description: `When the city hall is not found`,
    schema: { example: new CityHallNotFoundError() },
    status: 404,
  })
  @ApiResponse({
    description: `When a whatsapp account with same acronym already exists<br/>
      When a whatsapp account with same phone number already exists`,
    schema: { example: new WaAccountAlreadyExistsError() },
    status: 409,
  })
  @Post()
  async handle(@Body() body: CreateWaAccountData): Promise<void> {
    const result = await this.service.execute(body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case CityHallNotFoundError:
          throw new NotFoundException(error.message)
        case WaAccountAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
