import { randomUUID } from 'node:crypto'

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
} from '@nestjs/common'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodObject, z } from 'zod'

import type { UpdateWaAccountData } from 'src/contracts/wa-account'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import {
  ZodObj,
  ZodValidationError,
  ZodValidationPipe,
} from 'src/infra/pipes/zod-validation.pipe'

import { WA_ACCOUNT_URL } from '../../shared/constants'
import { WaAccountEntity } from '../../wa-account.entity'
import { WaAccountAlreadyExistsError, WaAccountNotFoundError } from '../errors'

import { UpdateWaAccountService } from './update-wa-account.service'

type UpdateWaAccountBodySchema = ZodObject<ZodObj<UpdateWaAccountData>>

extendZodWithOpenApi(z)

const updateWaAccountZodObject = z.object({
  acronym: z.string().optional().openapi({ example: 'HS1' }),
  city_hall_id: z.string().uuid().optional().openapi({ example: randomUUID() }),
  phone: z.string().optional().openapi({ example: '51 99999999' }),
}) as UpdateWaAccountBodySchema

const updateWaAccountOpenApiSchema = generateSchema(updateWaAccountZodObject)

@Controller(WA_ACCOUNT_URL)
@UsePipes(new ZodValidationPipe(updateWaAccountZodObject))
export class UpdateWaAccountController {
  constructor(private service: UpdateWaAccountService) {}

  @ApiTags('WaAccount')
  @ApiBody({ schema: updateWaAccountOpenApiSchema as any })
  @ApiResponse({
    description: 'WaAccount updated successful',
    //schema: { example: new WaAccountEntity() },
    status: 200,
    type: WaAccountEntity,
  })
  @ApiResponse({
    description: 'When the input data is invalid',
    schema: { example: ZodValidationError.example('acronym') },
    status: 400,
  })
  @ApiResponse({
    description: `When the whatsapp account is not found<br/>When the city hall is not found`,
    schema: { example: new WaAccountNotFoundError() },
    status: 404,
  })
  @ApiResponse({
    description: `When a whatsapp account with same acronym already exists<br/>
      When a whatsapp account with same phone number already exists`,
    schema: { example: new WaAccountAlreadyExistsError() },
    status: 409,
  })
  @Put(':id')
  async handle(
    @Param('id') id: string,
    @Body() body: UpdateWaAccountData
  ): Promise<WaAccountEntity> {
    const result = await this.service.execute(id, body)

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
