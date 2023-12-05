import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { ZodObject, z } from 'zod'

import type { CreateUserData } from 'src/contracts/account'
import { AllowUnauthenticated } from 'src/infra/auth/authentication.guard'
import { ZodObj, ZodValidationPipe } from 'src/infra/pipes/zod-validation.pipe'

import { USERS_URL } from '../constants'
import { UserAlreadyExistsError } from '../errors'

import { CreateUserService } from './create-user.service'

type CreateUserBodySchema = ZodObject<ZodObj<CreateUserData>>

const createUserValidationPipe = new ZodValidationPipe(
  z.object({
    email: z.string().email(),
    name: z.string(),
    password: z.string(),
    roles: z.array(z.nativeEnum(Role)).optional(),
  }) as CreateUserBodySchema
)

@Controller(USERS_URL)
@AllowUnauthenticated()
@UsePipes(createUserValidationPipe)
export class CreateUserController {
  constructor(private createUserService: CreateUserService) {}

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
