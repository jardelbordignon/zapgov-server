import { extendZodWithOpenApi, generateSchema } from '@anatine/zod-openapi'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodObject, z } from 'zod'

import type { AuthUserData, AuthUserResponse } from 'src/contracts/account'
import {
  ZodObj,
  ZodValidationError,
  ZodValidationPipe,
} from 'src/infra/pipes/zod-validation.pipe'
import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'

import { AUTH_URL } from '../../shared/constants'
import { WrongCredentialsError } from '../errors'

import { AuthUserService } from './auth-user.service'

type AuthUserBodySchema = ZodObject<ZodObj<AuthUserData>>

extendZodWithOpenApi(z)

const authUserZodObject = z.object({
  email: z.string().email().openapi({ example: 'johndoe@email.com' }),
  password: z.string().openapi({ example: 'Pwd@123' }),
}) as AuthUserBodySchema

const authUserOpenApiSchema = generateSchema(authUserZodObject)

@Controller(AUTH_URL)
@AllowUnauthenticated()
@UsePipes(new ZodValidationPipe(authUserZodObject))
export class AuthUserController {
  constructor(private authUserService: AuthUserService) {}

  @ApiTags('User')
  @ApiBody({ schema: authUserOpenApiSchema as any })
  @ApiResponse({ description: 'Authentication successful', status: 200 })
  @ApiResponse({
    description: 'When the input data is invalid',
    schema: { example: ZodValidationError.example('email') },
    status: 400,
  })
  @ApiResponse({
    description: 'When wrong email and/or password',
    schema: { example: new WrongCredentialsError() },
    status: 401,
  })
  @HttpCode(200)
  @Post()
  async handle(@Body() body: AuthUserData): Promise<AuthUserResponse> {
    const result = await this.authUserService.execute(body)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
