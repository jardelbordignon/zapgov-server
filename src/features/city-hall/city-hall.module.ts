import { Module } from '@nestjs/common'

import { FileStorageModule } from 'src/infra/providers/file-storage/file-storage.module'
import { I18nModule } from 'src/infra/providers/i18n/i18n.module'
import { PrismaModule } from 'src/infra/providers/prisma/prisma.module'

import { CityHallRepository } from './repositories/city-hall.repository'
import { PrismaCityHallRepository } from './repositories/prisma.city-hall.repository'
import { CreateCityHallController } from './use-cases/create-city-hall/create-city-hall.controller'
import { CreateCityHallService } from './use-cases/create-city-hall/create-city-hall.service'
import { DeleteCityHallController } from './use-cases/delete-city-hall/delete-city-hall.controller'
import { DeleteCityHallService } from './use-cases/delete-city-hall/delete-city-hall.service'
import { ListCityHallsController } from './use-cases/list-city-halls/list-city-halls.controller'
import { ListCityHallsService } from './use-cases/list-city-halls/list-city-halls.service'
import { ShowCityHallController } from './use-cases/show-city-hall/show-city-hall.controller'
import { ShowCityHallService } from './use-cases/show-city-hall/show-city-hall.service'
import { UpdateCityHallController } from './use-cases/update-city-hall/update-city-hall.controller'
import { UpdateCityHallService } from './use-cases/update-city-hall/update-city-hall.service'

@Module({
  controllers: [
    CreateCityHallController,
    DeleteCityHallController,
    ListCityHallsController,
    ShowCityHallController,
    UpdateCityHallController,
  ],
  imports: [PrismaModule, FileStorageModule, I18nModule],
  providers: [
    {
      provide: CityHallRepository,
      useClass: PrismaCityHallRepository,
    },
    CreateCityHallService,
    DeleteCityHallService,
    ListCityHallsService,
    ShowCityHallService,
    UpdateCityHallService,
  ],
})
export class CityHallModule {}
