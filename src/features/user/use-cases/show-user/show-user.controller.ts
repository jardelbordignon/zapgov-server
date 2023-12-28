import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { omitObjectProperties } from 'src/infra/utils/omit-object-properties'

import { USERS_URL } from '../../shared/constants'
import { UserEntity } from '../../user.entity'
import { UserNotFoundError } from '../errors'

import { ShowUserService } from './show-user.service'

@Controller(USERS_URL)
export class ShowUserController {
  constructor(private showUserService: ShowUserService) {}

  @ApiTags('User')
  @ApiBearerAuth()
  @ApiResponse({
    description: 'A user with omitted password',
    status: 200,
    type: UserEntity,
  })
  @Get('/:userId')
  async handle(@Param('userId') userId: string): Promise<UserEntity> {
    const result = await this.showUserService.execute(userId)

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
