import { Module } from '@nestjs/common'

import { FeaturesModule } from './features/features.module'
import { EnvModule } from './infra/env/env.module'

@Module({
  imports: [EnvModule, FeaturesModule],
})
export class AppModule {}
