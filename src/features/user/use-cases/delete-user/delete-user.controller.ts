import {
  BadRequestException,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'

import { CurrentUser } from 'src/infra/auth/current-user.decorator'
import { UserPayload } from 'src/infra/auth/jwt-strategy'

import { USERS_URL } from '../constants'
import { UserNotFoundError } from '../errors'

import { DeleteUserService } from './delete-user.service'

@Controller(USERS_URL)
export class DeleteUserController {
  constructor(private deleteUserService: DeleteUserService) {}

  @Delete()
  async handle(@CurrentUser() loggedUser: UserPayload): Promise<void> {
    const result = await this.deleteUserService.execute(
      loggedUser,
      loggedUser.sub,
      true
    )

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }

  @Delete('/:userId')
  async handleDeleteById(
    @CurrentUser() loggedUser: UserPayload,
    @Param('userId') userId: string,
    @Query('soft') soft: boolean
  ): Promise<void> {
    const result = await this.deleteUserService.execute(loggedUser, userId, soft)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
