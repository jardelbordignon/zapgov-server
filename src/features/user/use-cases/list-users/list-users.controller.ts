import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import {
  ApiPaginatedResponse,
  PaginatedResponse,
} from 'src/infra/providers/pagination/pagination.decorator'

import { UserEntity } from '../../user.entity'
import { USERS_URL } from '../constants'

import { ListUsersService } from './list-users.service'

@Controller(USERS_URL)
export class ListUsersController {
  constructor(private listUsersService: ListUsersService) {}

  @ApiTags('User')
  @ApiBearerAuth()
  @ApiPaginatedResponse(UserEntity, {
    description: 'A list of users (active or deleted) with omitted password',
  })
  @Get()
  async handle(
    @Query('deleted') deleted: boolean,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('limit') limit?: number
  ): Promise<PaginatedResponse<UserEntity>> {
    page = +page || 1
    perPage = +perPage || +limit || 20
    const result = await this.listUsersService.execute({ deleted, page, perPage })

    const formattedResultValue = {
      ...result.value,
      data: result.value.data.map(user => {
        delete user.password
        return user
      }),
    }

    return formattedResultValue
  }
}
