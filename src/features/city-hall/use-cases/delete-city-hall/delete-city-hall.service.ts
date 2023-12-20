import { Injectable } from '@nestjs/common'

import { FileStorage } from 'src/infra/providers/file-storage/file-storage'
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
  constructor(
    private cityHallRepository: CityHallRepository,
    private fileStorage: FileStorage
  ) {}

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

    await this.fileStorage.destroyFolder(`city-halls/${cityHall.id}`)

    return success(await this.cityHallRepository.delete(cityHallId))
  }
}
