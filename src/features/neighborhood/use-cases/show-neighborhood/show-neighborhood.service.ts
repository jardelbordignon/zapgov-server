import { Injectable } from '@nestjs/common'
import type { Neighborhood } from '@prisma/client'

import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { NeighborhoodRepository } from '../../repositories/neighborhood.repository'
import { NeighborhoodNotFoundError } from '../errors'

export type ShowNeighborhoodServiceResponse = FailureOrSuccess<
  NeighborhoodNotFoundError,
  Neighborhood
>

@Injectable()
export class ShowNeighborhoodService {
  constructor(
    private repository: NeighborhoodRepository,
    private i18n: I18n
  ) {}

  async execute(id: string): Promise<ShowNeighborhoodServiceResponse> {
    const neighborhood = await this.repository.findById(id)

    if (!neighborhood) {
      return failure(
        new NeighborhoodNotFoundError(this.i18n.t('neighborhoodNotFound'))
      )
    }

    return success(neighborhood)
  }
}
