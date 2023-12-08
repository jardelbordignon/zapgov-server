import { Module } from '@nestjs/common'

import { CityHallModule } from './city-hall/city-hall.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [UserModule, CityHallModule],
})
export class FeaturesModule {}
