import { Module } from '@nestjs/common'

import { CityHallModule } from './city-hall/city-hall.module'
import { ContactModule } from './contact/contact.module'
import { NeighborhoodModule } from './neighborhood/neighborhood.module'
import { SubCityHallModule } from './sub-city-hall/sub-city-hall.module'
import { UserModule } from './user/user.module'
import { WaAccountModule } from './wa-account/wa-account.module'

@Module({
  imports: [
    UserModule,
    CityHallModule,
    SubCityHallModule,
    NeighborhoodModule,
    WaAccountModule,
    ContactModule,
  ],
})
export class FeaturesModule {}
