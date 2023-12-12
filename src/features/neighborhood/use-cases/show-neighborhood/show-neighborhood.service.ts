import { Injectable } from '@nestjs/common'
import type { Neighborhood } from '@prisma/client'

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
  constructor(private repository: NeighborhoodRepository) {}

  async execute(id: string): Promise<ShowNeighborhoodServiceResponse> {
    const neighborhood = await this.repository.findById(id)

    if (!neighborhood) {
      return failure(new NeighborhoodNotFoundError())
    }

    return success(neighborhood)
  }
}
