import { Module } from '@nestjs/common'

import { CityHallModule } from './city-hall/city-hall.module'
import { SubCityHallModule } from './sub-city-hall/sub-city-hall.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [UserModule, CityHallModule, SubCityHallModule],
})
export class FeaturesModule {}
