import { Injectable } from '@nestjs/common'
import type { SubCityHall } from '@prisma/client'

import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import type { SubCityHallLocaleType } from '../../shared/locales/type'
import { SubCityHallNotFoundError } from '../errors'

export type ShowSubCityHallServiceResponse = FailureOrSuccess<
  SubCityHallNotFoundError,
  SubCityHall
>

@Injectable()
export class ShowSubCityHallService {
  constructor(
    private repository: SubCityHallRepository,
    private i18n: I18n
  ) {}

  async execute(id: string): Promise<ShowSubCityHallServiceResponse> {
    const subCityHall = await this.repository.findById(id)

    if (!subCityHall) {
      return failure(
        new SubCityHallNotFoundError(
          this.i18n.t<SubCityHallLocaleType>('subCityHallNotFound')
        )
      )
    }

    return success(subCityHall)
  }
}
