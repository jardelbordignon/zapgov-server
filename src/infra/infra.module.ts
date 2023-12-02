import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { EnvModule } from './env/env.module'

@Module({
  imports: [EnvModule, AuthModule],
})
export class InfraModule {}
