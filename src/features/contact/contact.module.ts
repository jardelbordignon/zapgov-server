import { Module } from '@nestjs/common'

import { I18nModule } from 'src/infra/providers/i18n/i18n.module'
import { PrismaModule } from 'src/infra/providers/prisma/prisma.module'

import { CityHallRepository } from '../city-hall/repositories/city-hall.repository'
import { PrismaCityHallRepository } from '../city-hall/repositories/prisma.city-hall.repository'
import { PrismaWaAccountRepository } from '../wa-account/repositories/prisma.wa-account.repository'
import { WaAccountRepository } from '../wa-account/repositories/wa-account.repository'

import { ContactRepository } from './repositories/contact.repository'
import { PrismaContactRepository } from './repositories/prisma.contact.repository'
import { CreateContactController } from './use-cases/create-contact/create-contact.controller'
import { CreateContactService } from './use-cases/create-contact/create-contact.service'

@Module({
  controllers: [CreateContactController],
  imports: [PrismaModule, I18nModule],
  providers: [
    {
      provide: ContactRepository,
      useClass: PrismaContactRepository,
    },
    {
      provide: CityHallRepository,
      useClass: PrismaCityHallRepository,
    },
    {
      provide: WaAccountRepository,
      useClass: PrismaWaAccountRepository,
    },
    CreateContactService,
  ],
})
export class ContactModule {}
