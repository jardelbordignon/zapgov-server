import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'

import { UserOmittedPassword } from 'src/contracts/account'
import { omitObjectProperties } from 'src/infra/utils/omit-object-properties'

import { USERS_URL } from '../constants'

import { ListUsersService } from './list-users.service'

@Controller(USERS_URL)
export class ListUsersController {
  constructor(private listUsersService: ListUsersService) {}

  @ApiBearerAuth()
  @ApiResponse({
    description: 'A list of users (active or deleted) with omitted password',
    status: 200,
  })
  @Get()
  async handle(@Query('deleted') deleted: boolean): Promise<UserOmittedPassword[]> {
    const result = await this.listUsersService.execute(deleted)

    return result.value
      ? result.value.map(user => omitObjectProperties(user, ['password']))
      : []
  }
}
