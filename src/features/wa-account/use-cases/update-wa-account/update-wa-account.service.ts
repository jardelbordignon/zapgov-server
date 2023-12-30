import { Injectable } from '@nestjs/common'

import type { UpdateWaAccountData } from 'src/contracts/wa-account'
import { CityHallRepository } from 'src/features/city-hall/repositories/city-hall.repository'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { WaAccountRepository } from '../../repositories/wa-account.repository'
import { WaAccountLocaleType } from '../../shared/locales/type'
import { WaAccountEntity } from '../../wa-account.entity'
import { WaAccountAlreadyExistsError, WaAccountNotFoundError } from '../errors'

type UpdateWaAccountServiceResponse = FailureOrSuccess<
  WaAccountAlreadyExistsError,
  WaAccountEntity
>

@Injectable()
export class UpdateWaAccountService {
  constructor(
    private waAccountRepository: WaAccountRepository,
    private cityHallRepository: CityHallRepository,
    private i18n: I18n
  ) {}

  async execute(
    id: string,
    data: UpdateWaAccountData
  ): Promise<UpdateWaAccountServiceResponse> {
    const waAccount = await this.waAccountRepository.findById(id)

    if (!waAccount) {
      return failure(
        new WaAccountNotFoundError(
          this.i18n.t<WaAccountLocaleType>('waAccountNotFound')
        )
      )
    }

    const { acronym, city_hall_id, phone } = data

    if (city_hall_id && city_hall_id !== waAccount.city_hall_id) {
      const cityHall = await this.cityHallRepository.findById(city_hall_id)

      if (!cityHall) {
        return failure(new CityHallNotFoundError(this.i18n.t('cityHallNotFound')))
      }
    }

    if (acronym && acronym !== waAccount.acronym) {
      const waAccountWithSameAcronym =
        await this.waAccountRepository.findByAcronym(acronym)

      if (waAccountWithSameAcronym) {
        return failure(
          new WaAccountAlreadyExistsError(
            this.i18n.t<WaAccountLocaleType>('waAccountWithSameAcronym', acronym)
          )
        )
      }
    }

    if (phone && phone !== waAccount.phone) {
      const waAccountWithSamePhone = await this.waAccountRepository.findByPhone(phone)

      if (waAccountWithSamePhone) {
        return failure(
          new WaAccountAlreadyExistsError(
            this.i18n.t<WaAccountLocaleType>('waAccountWithSamePhoneNumber', phone)
          )
        )
      }
    }

    return success(await this.waAccountRepository.update(id, data))
  }
}
