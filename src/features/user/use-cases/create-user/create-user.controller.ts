import { extendZodWithOpenApi, generateSchema } from '@anatine/zod-openapi'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { ZodObject, z } from 'zod'

import type { CreateUserData } from 'src/contracts/account'
import {
  ZodObj,
  ZodValidationError,
  ZodValidationPipe,
} from 'src/infra/pipes/zod-validation.pipe'
import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'

import { USERS_URL } from '../../shared/constants'
import { UserAlreadyExistsError } from '../errors'

import { CreateUserService } from './create-user.service'
type CreateUserBodySchema = ZodObject<ZodObj<CreateUserData>>

extendZodWithOpenApi(z)

const createUserZodObject = z.object({
  email: z.string().email().openapi({ example: 'johndoe@email.com' }),
  name: z.string().openapi({ example: 'John Doe' }),
  password: z.string().openapi({ example: 'Pwd@123' }),
  roles: z.array(z.nativeEnum(Role)).optional(),
}) as CreateUserBodySchema

const createUserOpenApiSchema = generateSchema(createUserZodObject)

@Controller(USERS_URL)
@AllowUnauthenticated()
@UsePipes(new ZodValidationPipe(createUserZodObject))
export class CreateUserController {
  constructor(private createUserService: CreateUserService) {}

  @ApiTags('User')
  @ApiBody({ schema: createUserOpenApiSchema as any })
  @ApiResponse({ description: 'User created successful', status: 201 })
  @ApiResponse({
    description: 'When the input data is invalid',
    schema: { example: ZodValidationError.example('email') },
    status: 400,
  })
  @ApiResponse({
    description: 'When an user with same email address already exists',
    schema: { example: new UserAlreadyExistsError() },
    status: 409,
  })
  @Post()
  async handle(@Body() body: CreateUserData): Promise<void> {
    const result = await this.createUserService.execute(body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
