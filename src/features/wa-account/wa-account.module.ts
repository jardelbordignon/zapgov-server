import { Module } from '@nestjs/common'

import { I18nModule } from 'src/infra/providers/i18n/i18n.module'
import { PrismaModule } from 'src/infra/providers/prisma/prisma.module'

import { CityHallRepository } from '../city-hall/repositories/city-hall.repository'
import { PrismaCityHallRepository } from '../city-hall/repositories/prisma.city-hall.repository'

import { PrismaWaAccountRepository } from './repositories/prisma.wa-account.repository'
import { WaAccountRepository } from './repositories/wa-account.repository'
import { CreateWaAccountController } from './use-cases/create-wa-account/create-wa-account.controller'
import { CreateWaAccountService } from './use-cases/create-wa-account/create-wa-account.service'
import { ListWaAccountsController } from './use-cases/list-wa-accounts/list-wa-accounts.controller'
import { ListWaAccountsService } from './use-cases/list-wa-accounts/list-wa-accounts.service'
import { UpdateWaAccountController } from './use-cases/update-wa-account/update-wa-account.controller'
import { UpdateWaAccountService } from './use-cases/update-wa-account/update-wa-account.service'

@Module({
  controllers: [
    CreateWaAccountController,
    ListWaAccountsController,
    UpdateWaAccountController,
  ],
  imports: [PrismaModule, I18nModule],
  providers: [
    {
      provide: WaAccountRepository,
      useClass: PrismaWaAccountRepository,
    },
    {
      provide: CityHallRepository,
      useClass: PrismaCityHallRepository,
    },
    CreateWaAccountService,
    ListWaAccountsService,
    UpdateWaAccountService,
  ],
})
export class WaAccountModule {}
