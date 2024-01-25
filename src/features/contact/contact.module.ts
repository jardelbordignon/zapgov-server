import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import {
  AddGoogleContactConsumer,
  AddGoogleContactProducer,
  BullAddGoogleContactProducer,
} from 'src/infra/jobs/add-google-contact'
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
import { ListContactsController } from './use-cases/list-contacts/list-contacts.controller'
import { ListContactsService } from './use-cases/list-contacts/list-contacts.service'

@Module({
  controllers: [CreateContactController, ListContactsController],
  imports: [
    PrismaModule,
    I18nModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'addGoogleContactsQueue',
    }),
  ],
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
    { provide: AddGoogleContactProducer, useClass: BullAddGoogleContactProducer },
    AddGoogleContactConsumer,
    CreateContactService,
    ListContactsService,
  ],
})
export class ContactModule {}
