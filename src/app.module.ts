import { Module } from '@nestjs/common'

import { FeaturesModule } from './features/features.module'
import { InfraModule } from './infra/infra.module'

@Module({
  imports: [InfraModule, FeaturesModule],
})
export class AppModule {}
