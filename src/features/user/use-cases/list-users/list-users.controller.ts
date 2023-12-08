import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserOmittedPassword } from 'src/contracts/account'
import { PaginatedResponse } from 'src/infra/types/pagination'
import { omitObjectProperties } from 'src/infra/utils/omit-object-properties'

import { USERS_URL } from '../constants'

import { ListUsersService } from './list-users.service'

@Controller(USERS_URL)
export class ListUsersController {
  constructor(private listUsersService: ListUsersService) {}

  @ApiTags('User')
  @ApiBearerAuth()
  @ApiResponse({
    description: 'A list of users (active or deleted) with omitted password',
    status: 200,
  })
  @Get()
  async handle(
    @Query('deleted') deleted: boolean,
    @Query('page') page,
    @Query('perPage') perPage,
    @Query('limit') limit
  ): Promise<PaginatedResponse<UserOmittedPassword>> {
    page = +page || 1
    perPage = +perPage || +limit || 20
    const result = await this.listUsersService.execute({ deleted, page, perPage })

    const formattedResultValue = {
      ...result.value,
      data: result.value.data.map(user => omitObjectProperties(user, ['password'])),
    }

    return formattedResultValue
  }
}
