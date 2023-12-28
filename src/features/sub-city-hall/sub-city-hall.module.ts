import { Module } from '@nestjs/common'

import { I18nModule } from 'src/infra/providers/i18n/i18n.module'
import { PrismaModule } from 'src/infra/providers/prisma/prisma.module'

import { CityHallRepository } from '../city-hall/repositories/city-hall.repository'
import { PrismaCityHallRepository } from '../city-hall/repositories/prisma.city-hall.repository'

import { PrismaSubCityHallRepository } from './repositories/prisma.sub-city-hall.repository'
import { SubCityHallRepository } from './repositories/sub-city-hall.repository'
import { CreateSubCityHallController } from './use-cases/create-sub-city-hall/create-sub-city-hall.controller'
import { CreateSubCityHallService } from './use-cases/create-sub-city-hall/create-sub-city-hall.service'
import { DeleteSubCityHallController } from './use-cases/delete-sub-city-hall/delete-sub-city-hall.controller'
import { DeleteSubCityHallService } from './use-cases/delete-sub-city-hall/delete-sub-city-hall.service'
import { ListSubCityHallsController } from './use-cases/list-sub-city-halls/list-sub-city-halls.controller'
import { ListSubCityHallsService } from './use-cases/list-sub-city-halls/list-sub-city-halls.service'
import { ShowSubCityHallController } from './use-cases/show-sub-city-hall/show-sub-city-hall.controller'
import { ShowSubCityHallService } from './use-cases/show-sub-city-hall/show-sub-city-hall.service'
import { UpdateSubCityHallController } from './use-cases/update-sub-city-hall/update-sub-city-hall.controller'
import { UpdateSubCityHallService } from './use-cases/update-sub-city-hall/update-sub-city-hall.service'

@Module({
  controllers: [
    CreateSubCityHallController,
    DeleteSubCityHallController,
    ListSubCityHallsController,
    ShowSubCityHallController,
    UpdateSubCityHallController,
  ],
  imports: [PrismaModule, I18nModule],
  providers: [
    {
      provide: CityHallRepository,
      useClass: PrismaCityHallRepository,
    },
    {
      provide: SubCityHallRepository,
      useClass: PrismaSubCityHallRepository,
    },
    CreateSubCityHallService,
    DeleteSubCityHallService,
    ListSubCityHallsService,
    ShowSubCityHallService,
    UpdateSubCityHallService,
  ],
})
export class SubCityHallModule {}
