import { Injectable } from '@nestjs/common'

import { I18n } from 'src/infra/providers/i18n/i18n'
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
  constructor(
    private neighborhoodRepository: NeighborhoodRepository,
    private i18n: I18n
  ) {}

  async execute(
    neighborhoodId: string,
    soft: boolean
  ): Promise<DeleteNeighborhoodServiceResponse> {
    const neighborhood = await this.neighborhoodRepository.findById(neighborhoodId)

    if (!neighborhood) {
      return failure(
        new NeighborhoodNotFoundError(this.i18n.t('neighborhoodNotFound'))
      )
    }

    if (soft) {
      await this.neighborhoodRepository.update(neighborhoodId, {
        deleted_at: new Date(),
      })
      return success(undefined)
    }

    return success(await this.neighborhoodRepository.delete(neighborhoodId))
  }
}
