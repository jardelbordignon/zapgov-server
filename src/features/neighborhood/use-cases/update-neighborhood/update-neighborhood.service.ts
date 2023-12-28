import { Injectable } from '@nestjs/common'
import type { Neighborhood } from '@prisma/client'

import type { UpdateNeighborhoodData } from 'src/contracts/neighborhoods'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { NeighborhoodRepository } from '../../repositories/neighborhood.repository'
import { NeighborhoodAlreadyExistsError, NeighborhoodNotFoundError } from '../errors'

export type UpdateNeighborhoodServiceResponse = FailureOrSuccess<
  NeighborhoodNotFoundError | NeighborhoodAlreadyExistsError,
  Neighborhood
>

@Injectable()
export class UpdateNeighborhoodService {
  constructor(
    private neighborhoodRepository: NeighborhoodRepository,
    private i18n: I18n
  ) {}

  async execute(
    neighborhoodId: string,
    data: UpdateNeighborhoodData
  ): Promise<UpdateNeighborhoodServiceResponse> {
    const neighborhood = await this.neighborhoodRepository.findById(neighborhoodId)

    if (!neighborhood) {
      return failure(
        new NeighborhoodNotFoundError(this.i18n.t('neighborhoodNotFound'))
      )
    }

    if (data.name && data.name !== neighborhood.name) {
      const neighborhoodWithSameName = await this.neighborhoodRepository.findByName(
        data.name
      )

      const sub_city_hall_id = data.sub_city_hall_id || neighborhood.sub_city_hall_id

      if (
        neighborhoodWithSameName &&
        neighborhoodWithSameName.sub_city_hall_id === sub_city_hall_id
      ) {
        return failure(
          new NeighborhoodAlreadyExistsError(
            this.i18n.t('neighborhoodWithSameName', data.name)
          )
        )
      }
    }

    const updatedNeighborhood = await this.neighborhoodRepository.update(
      neighborhoodId,
      data
    )

    return success(updatedNeighborhood)
  }
}
