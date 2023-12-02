import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { CryptographyModule } from './cryptography/cryptography.module'
import { EnvModule } from './env/env.module'

@Module({
  imports: [EnvModule, AuthModule, CryptographyModule],
})
export class InfraModule {}
