import { Module } from '@nestjs/common'

import { PrismaService } from 'src/infra/prisma.service'

import { CityHallRepository } from './repositories/city-hall.repository'
import { PrismaCityHallRepository } from './repositories/prisma.city-hall.repository'
import { CreateCityHallController } from './use-cases/create-city-hall/create-city-hall.controller'
import { CreateCityHallService } from './use-cases/create-city-hall/create-city-hall.service'
import { ListCityHallsController } from './use-cases/list-city-halls/list-city-halls.controller'
import { ListCityHallsService } from './use-cases/list-city-halls/list-city-halls.service'
import { UpdateCityHallController } from './use-cases/update-city-hall/update-city-hall.controller'
import { UpdateCityHallService } from './use-cases/update-city-hall/update-city-hall.service'

@Module({
  controllers: [
    CreateCityHallController,
    ListCityHallsController,
    UpdateCityHallController,
  ],
  exports: [PrismaService],
  providers: [
    PrismaService,
    {
      provide: CityHallRepository,
      useClass: PrismaCityHallRepository,
    },
    CreateCityHallService,
    ListCityHallsService,
    UpdateCityHallService,
  ],
})
export class CityHallModule {}
