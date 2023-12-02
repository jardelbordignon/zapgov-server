import { Body, Controller, Post } from '@nestjs/common'

import type { CreateUserData } from 'src/contracts/account'

import { USERS_URL } from '../constants'

import { CreateUserService } from './create-user.service'

@Controller(USERS_URL)
export class CreateUserController {
  constructor(private createUserService: CreateUserService) {}

  @Post()
  async handle(@Body() body: CreateUserData): Promise<void> {
    const result = await this.createUserService.execute(body)
    return result
  }
}
