import { Controller, Get } from '@nestjs/common'
import { ApiExcludeEndpoint } from '@nestjs/swagger'

import { AllowUnauthenticated } from './infra/auth/authentication.guard'

@AllowUnauthenticated()
@Controller()
export class AppController {
  constructor() {}

  @ApiExcludeEndpoint()
  @Get()
  getHello(): string {
    return '🚀 Server is running'
  }
}
