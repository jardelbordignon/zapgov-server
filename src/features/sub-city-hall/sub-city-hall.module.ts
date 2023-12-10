import { Module } from '@nestjs/common'

import { PrismaService } from 'src/infra/prisma.service'

import { CityHallRepository } from '../city-hall/repositories/city-hall.repository'
import { PrismaCityHallRepository } from '../city-hall/repositories/prisma.city-hall.repository'

import { PrismaSubCityHallRepository } from './repositories/prisma.sub-city-hall.repository'
import { SubCityHallRepository } from './repositories/sub-city-hall.repository'
import { CreateSubCityHallController } from './use-cases/create-sub-city-hall/create-sub-city-hall.controller'
import { CreateSubCityHallService } from './use-cases/create-sub-city-hall/create-sub-city-hall.service'

@Module({
  controllers: [CreateSubCityHallController],
  exports: [PrismaService],
  providers: [
    PrismaService,
    {
      provide: CityHallRepository,
      useClass: PrismaCityHallRepository,
    },
    {
      provide: SubCityHallRepository,
      useClass: PrismaSubCityHallRepository,
    },
    CreateSubCityHallService,
  ],
})
export class SubCityHallModule {}
