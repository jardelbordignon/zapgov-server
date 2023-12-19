import { Injectable } from '@nestjs/common'

import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { CityHallRepository } from '../../repositories/city-hall.repository'
import { CityHallNotFoundError } from '../errors'

export type DeleteCityHallServiceResponse = FailureOrSuccess<
  CityHallNotFoundError,
  void
>

@Injectable()
export class DeleteCityHallService {
  constructor(private cityHallRepository: CityHallRepository) {}

  async execute(
    cityHallId: string,
    soft: boolean
  ): Promise<DeleteCityHallServiceResponse> {
    const cityHall = await this.cityHallRepository.findById(cityHallId)

    if (!cityHall) {
      return failure(new CityHallNotFoundError())
    }

    if (soft) {
      await this.cityHallRepository.update(cityHallId, { deleted_at: new Date() })
      return success(undefined)
    }

    return success(await this.cityHallRepository.delete(cityHallId))
  }
}
