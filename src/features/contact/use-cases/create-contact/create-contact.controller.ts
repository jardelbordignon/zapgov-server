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

import type { CreateContactInputData } from 'src/contracts/contacts'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import {
  ZodObj,
  ZodValidationError,
  ZodValidationPipe,
} from 'src/infra/pipes/zod-validation.pipe'
import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'

import { CONTACTS_URL } from '../../shared/constants'
import { ContactAlreadyExistsError } from '../errors'

import { CreateContactService } from './create-contact.service'

type CreateContactBodySchema = ZodObject<ZodObj<CreateContactInputData>>

extendZodWithOpenApi(z)

const createContactZodObject = z.object({
  city_hall_id: z.string().uuid(),
  gender: z.string().openapi({ example: 'M' }),
  name: z.string().openapi({ example: 'John Doe' }),
  phone: z.string().openapi({ example: '51 999999999' }),
}) as CreateContactBodySchema

const createContactOpenApiSchema = generateSchema(createContactZodObject)

@AllowUnauthenticated()
@Controller(CONTACTS_URL)
export class CreateContactController {
  constructor(private createContactService: CreateContactService) {}

  @ApiTags('Contact')
  //@ApiBearerAuth()
  @ApiBody({ schema: createContactOpenApiSchema as any })
  @ApiResponse({ description: 'Contact registered successful', status: 201 })
  @ApiResponse({
    description: 'When the input data is invalid',
    schema: { example: ZodValidationError.example('name') },
    status: 400,
  })
  @ApiResponse({
    description: 'When the linked whatsapp account is not found',
    schema: { example: new CityHallNotFoundError() },
    status: 404,
  })
  @ApiResponse({
    description: 'When a contact with same phone number already exists',
    schema: { example: new ContactAlreadyExistsError() },
    status: 409,
  })
  @UsePipes(new ZodValidationPipe(createContactZodObject))
  @Post()
  async handle(@Body() body: CreateContactInputData): Promise<void> {
    const result = await this.createContactService.execute(body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case CityHallNotFoundError:
          throw new NotFoundException(error.message)
        case ContactAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
