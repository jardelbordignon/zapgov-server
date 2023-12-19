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
    @Query('deleted') deleted?: boolean,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') searchTerm?: string
  ): Promise<PaginatedResponse<UserEntity>> {
    page = Number(page || 1)
    perPage = Number(perPage || 20)
    const result = await this.listUsersService.execute({
      deleted,
      page,
      perPage,
      searchTerm,
    })

    if (!result.value) return new PaginatedResponse()

    const formattedResultValue = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      data: result.value.data.map(({ password, ...user }) => user),
      meta: result.value.meta,
    }

    return formattedResultValue
  }
}
