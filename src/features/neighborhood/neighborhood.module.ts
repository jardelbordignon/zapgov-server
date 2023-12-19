import { Module } from '@nestjs/common'

import { PrismaModule } from 'src/infra/providers/prisma/prisma.module'

import { CityHallRepository } from '../city-hall/repositories/city-hall.repository'
import { PrismaCityHallRepository } from '../city-hall/repositories/prisma.city-hall.repository'
import { PrismaSubCityHallRepository } from '../sub-city-hall/repositories/prisma.sub-city-hall.repository'
import { SubCityHallRepository } from '../sub-city-hall/repositories/sub-city-hall.repository'

import { NeighborhoodRepository } from './repositories/neighborhood.repository'
import { PrismaNeighborhoodRepository } from './repositories/prisma.neighborhood.repository'
import { CreateNeighborhoodController } from './use-cases/create-neighborhood/create-neighborhood.controller'
import { CreateNeighborhoodService } from './use-cases/create-neighborhood/create-neighborhood.service'
import { DeleteNeighborhoodController } from './use-cases/delete-neighborhood/delete-neighborhood.controller'
import { DeleteNeighborhoodService } from './use-cases/delete-neighborhood/delete-neighborhood.service'
import { ListNeighborhoodsController } from './use-cases/list-neighborhoods/list-neighborhoods.controller'
import { ListNeighborhoodsService } from './use-cases/list-neighborhoods/list-neighborhoods.service'
import { ShowNeighborhoodController } from './use-cases/show-neighborhood/show-neighborhood.controller'
import { ShowNeighborhoodService } from './use-cases/show-neighborhood/show-neighborhood.service'
import { UpdateNeighborhoodController } from './use-cases/update-neighborhood/update-neighborhood.controller'
import { UpdateNeighborhoodService } from './use-cases/update-neighborhood/update-neighborhood.service'

@Module({
  controllers: [
    CreateNeighborhoodController,
    DeleteNeighborhoodController,
    ListNeighborhoodsController,
    ShowNeighborhoodController,
    UpdateNeighborhoodController,
  ],
  imports: [PrismaModule],
  providers: [
    {
      provide: CityHallRepository,
      useClass: PrismaCityHallRepository,
    },
    {
      provide: SubCityHallRepository,
      useClass: PrismaSubCityHallRepository,
    },
    {
      provide: NeighborhoodRepository,
      useClass: PrismaNeighborhoodRepository,
    },
    CreateNeighborhoodService,
    DeleteNeighborhoodService,
    ListNeighborhoodsService,
    ShowNeighborhoodService,
    UpdateNeighborhoodService,
  ],
})
export class NeighborhoodModule {}
