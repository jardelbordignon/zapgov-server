import { Module } from '@nestjs/common'

import { EnvModule } from './env/env.module'
import { ProvidersModule } from './providers/providers.module'

@Module({
  imports: [EnvModule, ProvidersModule],
})
export class InfraModule {}
