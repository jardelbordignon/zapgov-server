import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'

import type { UserOmittedPassword } from 'src/contracts/account'
import { omitObjectProperties } from 'src/infra/utils/omit-object-properties'

import { USERS_URL } from '../constants'
import { UserNotFoundError } from '../errors'

import { ShowUserService } from './show-user.service'

@Controller(USERS_URL)
export class ShowUserController {
  constructor(private showUserService: ShowUserService) {}

  @Get('/:id')
  async handle(@Param('id') id: string): Promise<UserOmittedPassword> {
    const result = await this.showUserService.execute(id)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return omitObjectProperties(result.value, ['password'])
  }
}
