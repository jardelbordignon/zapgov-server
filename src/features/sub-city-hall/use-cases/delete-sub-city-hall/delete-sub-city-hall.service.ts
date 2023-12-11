import { Injectable } from '@nestjs/common'

import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import { SubCityHallNotFoundError } from '../errors'

export type DeleteSubCityHallServiceResponse = FailureOrSuccess<
  SubCityHallNotFoundError,
  void
>

@Injectable()
export class DeleteSubCityHallService {
  constructor(private subSubCityHallRepository: SubCityHallRepository) {}

  async execute(
    subSubCityHallId: string,
    soft: boolean
  ): Promise<DeleteSubCityHallServiceResponse> {
    const subSubCityHall =
      await this.subSubCityHallRepository.findById(subSubCityHallId)

    if (!subSubCityHall) {
      return failure(new SubCityHallNotFoundError())
    }

    if (soft) {
      await this.subSubCityHallRepository.update(subSubCityHallId, {
        deleted_at: new Date(),
      })
      return success(null)
    }

    return success(await this.subSubCityHallRepository.delete(subSubCityHallId))
  }
}
