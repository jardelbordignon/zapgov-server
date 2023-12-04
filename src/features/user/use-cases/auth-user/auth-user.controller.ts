import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { ZodObject, z } from 'zod'

import type { AuthUserData, AuthUserResponse } from 'src/contracts/account'
import { AllowUnauthenticated } from 'src/infra/auth/authentication.guard'
import { ZodObj, ZodValidationPipe } from 'src/infra/pipes/zod-validation.pipe'

import { AUTH_URL } from '../constants'
import { WrongCredentialsError } from '../errors'

import { AuthUserService } from './auth-user.service'

type AuthUserBodySchema = ZodObject<ZodObj<AuthUserData>>

const authUserValidationPipe = new ZodValidationPipe(
  z.object({
    email: z.string().email(),
    password: z.string(),
  }) as AuthUserBodySchema
)

@Controller(AUTH_URL)
@AllowUnauthenticated()
@UsePipes(authUserValidationPipe)
export class AuthUserController {
  constructor(private authUserService: AuthUserService) {}

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
