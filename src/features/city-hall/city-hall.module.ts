import { Module } from '@nestjs/common'

import { PrismaService } from 'src/infra/prisma.service'

import { CityHallRepository } from './repositories/city-hall.repository'
import { PrismaCityHallRepository } from './repositories/prisma.city-hall.repository'
import { CreateCityHallController } from './use-cases/create-city-hall/create-city-hall.controller'
import { CreateCityHallService } from './use-cases/create-city-hall/create-city-hall.service'
import { ListCityHallsController } from './use-cases/list-city-halls/list-city-halls.controller'
import { ListCityHallsService } from './use-cases/list-city-halls/list-city-halls.service'

@Module({
  controllers: [CreateCityHallController, ListCityHallsController],
  exports: [PrismaService],
  providers: [
    PrismaService,
    {
      provide: CityHallRepository,
      useClass: PrismaCityHallRepository,
    },
    CreateCityHallService,
    ListCityHallsService,
  ],
})
export class CityHallModule {}
