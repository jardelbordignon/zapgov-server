import { Injectable } from '@nestjs/common'
import type { SubCityHall } from '@prisma/client'

import type { UpdateSubCityHallData } from 'src/contracts/sub-city-halls'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import type { SubCityHallLocaleType } from '../../shared/locales/type'
import { SubCityHallAlreadyExistsError, SubCityHallNotFoundError } from '../errors'

export type UpdateSubCityHallServiceResponse = FailureOrSuccess<
  SubCityHallNotFoundError | SubCityHallAlreadyExistsError,
  SubCityHall
>

@Injectable()
export class UpdateSubCityHallService {
  constructor(
    private repository: SubCityHallRepository,
    private i18n: I18n
  ) {}

  async execute(
    subCityHallId: string,
    data: UpdateSubCityHallData
  ): Promise<UpdateSubCityHallServiceResponse> {
    const subCityHall = await this.repository.findById(subCityHallId)

    if (!subCityHall) {
      return failure(
        new SubCityHallNotFoundError(
          this.i18n.t<SubCityHallLocaleType>('subCityHallNotFound')
        )
      )
    }

    if (data.email && data.email !== subCityHall.email) {
      const cityHallWithSameEmail = await this.repository.findByEmail(data.email)

      if (cityHallWithSameEmail) {
        return failure(
          new SubCityHallAlreadyExistsError(
            this.i18n.t<SubCityHallLocaleType>('subCityHallWithSameEmail', data.email)
          )
        )
      }
    }

    const updatedSubCityHall = await this.repository.update(subCityHallId, data)

    return success(updatedSubCityHall)
  }
}
