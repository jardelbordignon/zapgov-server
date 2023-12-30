import { Injectable } from '@nestjs/common'

import type { CreateWaAccountData } from 'src/contracts/wa-account'
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
import { WaAccountAlreadyExistsError } from '../errors'

type CreateWaAccountServiceResponse = FailureOrSuccess<
  WaAccountAlreadyExistsError,
  void
>

@Injectable()
export class CreateWaAccountService {
  constructor(
    private waAccountRepository: WaAccountRepository,
    private cityHallRepository: CityHallRepository,
    private i18n: I18n
  ) {}

  async execute(data: CreateWaAccountData): Promise<CreateWaAccountServiceResponse> {
    const cityHall = await this.cityHallRepository.findById(data.city_hall_id)

    if (!cityHall) {
      return failure(new CityHallNotFoundError(this.i18n.t('cityHallNotFound')))
    }

    const waAccountWithSameAcronym = await this.waAccountRepository.findByAcronym(
      data.acronym
    )

    if (waAccountWithSameAcronym) {
      return failure(
        new WaAccountAlreadyExistsError(
          this.i18n.t<WaAccountLocaleType>('waAccountWithSameAcronym', data.acronym)
        )
      )
    }

    const waAccountWithSamePhone = await this.waAccountRepository.findByPhone(
      data.phone
    )

    if (waAccountWithSamePhone) {
      return failure(
        new WaAccountAlreadyExistsError(
          this.i18n.t<WaAccountLocaleType>('waAccountWithSamePhoneNumber', data.phone)
        )
      )
    }

    await this.waAccountRepository.create(data)

    return success(undefined)
  }
}
