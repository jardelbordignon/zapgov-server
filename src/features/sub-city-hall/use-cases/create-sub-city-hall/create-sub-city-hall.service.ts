import { Injectable } from '@nestjs/common'

import type { CreateSubCityHallData } from 'src/contracts/sub-city-halls'
import { CityHallRepository } from 'src/features/city-hall/repositories/city-hall.repository'
import type { CityHallLocaleType } from 'src/features/city-hall/shared/locales/type'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import type { SubCityHallLocaleType } from '../../shared/locales/type'
import { SubCityHallAlreadyExistsError } from '../errors'

type CreateSubCityHallServiceResponse = FailureOrSuccess<
  SubCityHallAlreadyExistsError,
  void
>

@Injectable()
export class CreateSubCityHallService {
  constructor(
    private subCityHallRepository: SubCityHallRepository,
    private cityHallRepository: CityHallRepository,
    private i18n: I18n
  ) {}

  async execute(
    data: CreateSubCityHallData
  ): Promise<CreateSubCityHallServiceResponse> {
    const cityHall = await this.cityHallRepository.findById(data.city_hall_id)

    if (!cityHall) {
      return failure(
        new CityHallNotFoundError(this.i18n.t<CityHallLocaleType>('cityHallNotFound'))
      )
    }

    if (data.email) {
      const subCityHallWithSameEmail = await this.subCityHallRepository.findByEmail(
        data.email
      )

      if (subCityHallWithSameEmail) {
        return failure(
          new SubCityHallAlreadyExistsError(
            this.i18n.t<SubCityHallLocaleType>('subCityHallWithSameEmail', data.email)
          )
        )
      }
    }

    await this.subCityHallRepository.create(data)

    return success(undefined)
  }
}
