import { Controller, Get } from '@nestjs/common'

import { UserOmittedPassword } from 'src/contracts/account'
import { omitObjectProperties } from 'src/infra/utils/omit-object-properties'

import { USERS_URL } from '../constants'

import { ListUsersService } from './list-users.service'

@Controller(USERS_URL)
export class ListUsersController {
  constructor(private listUsersService: ListUsersService) {}

  @Get()
  async handle(): Promise<UserOmittedPassword[]> {
    const result = await this.listUsersService.execute()

    return result.value
      ? result.value.map(user => omitObjectProperties(user, ['password']))
      : []
  }
}
