import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Query,
  UnauthorizedException,
  applyDecorators,
} from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CurrentUser } from 'src/infra/auth/current-user.decorator'
import { UserPayload } from 'src/infra/auth/jwt-strategy'

import { USERS_URL } from '../constants'
import { UnauthorizedToDeleteAnAdminUserError, UserNotFoundError } from '../errors'

import { DeleteUserService, DeleteUserServiceResponse } from './delete-user.service'

function DeleteUserApiResponse() {
  return applyDecorators(
    HttpCode(204),
    ApiBearerAuth(),
    ApiResponse({ description: 'User deleted successful', status: 204 }),
    ApiResponse({
      description: 'When user not found',
      status: 404,
    }),
    ApiResponse({
      description: 'When trying to delete an admin user',
      status: 401,
    })
  )
}

@ApiTags('User')
@Controller(USERS_URL)
export class DeleteUserController {
  constructor(private deleteUserService: DeleteUserService) {}

  private handleResult(result: DeleteUserServiceResponse) {
    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        case UnauthorizedToDeleteAnAdminUserError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }

  @DeleteUserApiResponse()
  @Delete()
  async handle(@CurrentUser() loggedUser: UserPayload): Promise<void> {
    const result = await this.deleteUserService.execute(
      loggedUser,
      loggedUser.sub,
      true
    )

    return this.handleResult(result)
  }

  @DeleteUserApiResponse()
  @Delete('/:userId')
  async handleDeleteById(
    @CurrentUser() loggedUser: UserPayload,
    @Param('userId') userId: string,
    @Query('soft') soft: boolean
  ): Promise<void> {
    const result = await this.deleteUserService.execute(loggedUser, userId, soft)

    return this.handleResult(result)
  }
}
