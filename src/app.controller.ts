import { Controller, Get } from '@nestjs/common'

import { AllowUnauthenticated } from './infra/auth/authentication.guard'

@AllowUnauthenticated()
@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return '🚀 Server is running'
  }
}
