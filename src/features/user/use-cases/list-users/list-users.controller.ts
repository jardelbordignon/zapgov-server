import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import {
  ApiPaginatedResponse,
  PaginatedResponse,
  PaginationParams,
  PaginationQuery,
} from 'src/infra/providers/pagination'

import { USERS_URL } from '../../shared/constants'
import { UserEntity } from '../../user.entity'

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
    @PaginationQuery() params: PaginationParams
  ): Promise<PaginatedResponse<UserEntity>> {
    const result = await this.listUsersService.execute(params)

    if (!result.value) return new PaginatedResponse()

    const formattedResultValue = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      data: result.value.data.map(({ password, ...user }) => user),
      meta: result.value.meta,
    }

    return formattedResultValue
  }
}
