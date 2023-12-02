import { Body, Controller, Post } from '@nestjs/common'

import type { AuthUserData, AuthUserResponse } from 'src/contracts/account'

import { AUTH_URL } from '../constants'

import { AuthUserService } from './auth-user.service'

@Controller(AUTH_URL)
export class AuthUserController {
  constructor(private authUserService: AuthUserService) {}

  @Post()
  async handle(@Body() body: AuthUserData): Promise<AuthUserResponse> {
    const result = await this.authUserService.execute(body)
    return result
  }
}
