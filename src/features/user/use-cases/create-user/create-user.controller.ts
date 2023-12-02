import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common'

import type { CreateUserData } from 'src/contracts/account'

import { USERS_URL } from '../constants'
import { UserAlreadyExistsError } from '../errors'

import { CreateUserService } from './create-user.service'

@Controller(USERS_URL)
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
