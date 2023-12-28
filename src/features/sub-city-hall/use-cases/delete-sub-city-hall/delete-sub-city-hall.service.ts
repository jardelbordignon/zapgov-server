import { Injectable } from '@nestjs/common'

import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import type { SubCityHallLocaleType } from '../../shared/locales/type'
import { SubCityHallNotFoundError } from '../errors'

export type DeleteSubCityHallServiceResponse = FailureOrSuccess<
  SubCityHallNotFoundError,
  void
>

@Injectable()
export class DeleteSubCityHallService {
  constructor(
    private subSubCityHallRepository: SubCityHallRepository,
    private i18n: I18n
  ) {}

  async execute(
    subSubCityHallId: string,
    soft: boolean
  ): Promise<DeleteSubCityHallServiceResponse> {
    const subSubCityHall =
      await this.subSubCityHallRepository.findById(subSubCityHallId)

    if (!subSubCityHall) {
      return failure(
        new SubCityHallNotFoundError(
          this.i18n.t<SubCityHallLocaleType>('subCityHallNotFound')
        )
      )
    }

    if (soft) {
      await this.subSubCityHallRepository.update(subSubCityHallId, {
        deleted_at: new Date(),
      })
      return success(undefined)
    }

    return success(await this.subSubCityHallRepository.delete(subSubCityHallId))
  }
}
