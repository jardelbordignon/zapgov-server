import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import {
  ApiListResponse,
  ListParams,
  ListQuery,
  ListResponse,
} from 'src/infra/providers/list'

import { USERS_URL } from '../../shared/constants'
import { UserEntity } from '../../user.entity'

import { ListUsersService } from './list-users.service'

@Controller(USERS_URL)
export class ListUsersController {
  constructor(private listUsersService: ListUsersService) {}

  @ApiTags('User')
  @ApiBearerAuth()
  @ApiListResponse(UserEntity, {
    description: 'A list of users (active or deleted) with omitted password',
  })
  @Get()
  async handle(@ListQuery() params: ListParams): Promise<ListResponse<UserEntity>> {
    const result = await this.listUsersService.execute(params)

    if (!result.value) return new ListResponse()

    const formattedResultValue = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      data: result.value.data.map(({ password, ...user }) => user),
      meta: result.value.meta,
    }

    return formattedResultValue
  }
}
