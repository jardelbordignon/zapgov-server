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
import { Role } from '@prisma/client'
import { ZodObject, z } from 'zod'

import type { CreateUserData } from 'src/contracts/account'
import { AllowUnauthenticated } from 'src/infra/auth/authentication.guard'
import { ZodObj, ZodValidationPipe } from 'src/infra/pipes/zod-validation.pipe'

import { USERS_URL } from '../constants'
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
    description: 'When an user with same email address already exists',
    status: 401,
  })
  @Post()
  async handle(@Body() body: CreateUserData): Promise<void> {
    const result = await this.createUserService.execute(body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
