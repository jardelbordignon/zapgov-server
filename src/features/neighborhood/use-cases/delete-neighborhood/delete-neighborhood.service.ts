import { Injectable } from '@nestjs/common'

import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { NeighborhoodRepository } from '../../repositories/neighborhood.repository'
import { NeighborhoodNotFoundError } from '../errors'

export type DeleteNeighborhoodServiceResponse = FailureOrSuccess<
  NeighborhoodNotFoundError,
  void
>

@Injectable()
export class DeleteNeighborhoodService {
  constructor(private neighborhoodRepository: NeighborhoodRepository) {}

  async execute(
    neighborhoodId: string,
    soft: boolean
  ): Promise<DeleteNeighborhoodServiceResponse> {
    const neighborhood = await this.neighborhoodRepository.findById(neighborhoodId)

    if (!neighborhood) {
      return failure(new NeighborhoodNotFoundError())
    }

    if (soft) {
      await this.neighborhoodRepository.update(neighborhoodId, {
        deleted_at: new Date(),
      })
      return success(null)
    }

    return success(await this.neighborhoodRepository.delete(neighborhoodId))
  }
}
