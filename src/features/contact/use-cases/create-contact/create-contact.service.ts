import { Injectable } from '@nestjs/common'

import type {
  CreateContactData,
  CreateContactInputData,
} from 'src/contracts/contacts'
import { CityHallRepository } from 'src/features/city-hall/repositories/city-hall.repository'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { WaAccountRepository } from 'src/features/wa-account/repositories/wa-account.repository'
import { WaAccountNotFoundError } from 'src/features/wa-account/use-cases/errors'
import { AddGoogleContactProducer } from 'src/infra/jobs/add-google-contact'
import { GoogleContactData } from 'src/infra/jobs/add-google-contact/google-contact'
import { I18n } from 'src/infra/providers/i18n/i18n'
import { calcAge } from 'src/infra/utils/date-formatters'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { ContactRepository } from '../../repositories/contact.repository'
import { ContactAlreadyExistsError } from '../errors'

type CreateContactServiceResponse = FailureOrSuccess<ContactAlreadyExistsError, void>

@Injectable()
export class CreateContactService {
  constructor(
    private contactRepository: ContactRepository,
    private cityHallRepository: CityHallRepository,
    private waAccountRepository: WaAccountRepository,
    private i18n: I18n,
    private addGoogleContactProducer: AddGoogleContactProducer
  ) {}

  async execute(data: CreateContactInputData): Promise<CreateContactServiceResponse> {
    const { city_hall_id, phone } = data

    const cityHall = await this.cityHallRepository.findById(city_hall_id)

    if (!cityHall) {
      return failure(new CityHallNotFoundError(this.i18n.t('cityHallNotFound')))
    }

    const contactWithSamePhone = await this.contactRepository.findByPhone(phone)

    if (contactWithSamePhone) {
      return failure(
        new ContactAlreadyExistsError(this.i18n.t('contactWithSamePhone', phone))
      )
    }

    const waAccounts = await this.waAccountRepository.findAll({
      filter: `city_hall_id:${city_hall_id}`,
    })

    if (!waAccounts.data.length) {
      return failure(new WaAccountNotFoundError(this.i18n.t('waAccountNotFound')))
    }

    for (const waAccount of waAccounts.data) {
      if (waAccount.contacts_qty < 4000) {
        const contactData: CreateContactData = {
          ...data,
          wa_account_id: waAccount.id,
        }

        const googleContactData: GoogleContactData = {
          code: `${waAccount.acronym}-${waAccount.contacts_qty.toString().padStart(4, '0')}`,
          gender: contactData.gender,
          name: contactData.name,
          neighborhood: 'neighborhood',
          phone_number: contactData.phone,
          year_old: calcAge(contactData.birth_date).toString(),
        }

        await this.contactRepository.create(contactData).then(async () => {
          await this.addGoogleContactProducer.send(googleContactData)

          const contacts_qty = ++waAccount.contacts_qty

          await this.waAccountRepository.update(waAccount.id, { contacts_qty })
        })

        break
      }
    }

    return success(undefined)
  }
}
