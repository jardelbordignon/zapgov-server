import { Injectable } from '@nestjs/common'
import type { Neighborhood } from '@prisma/client'

import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { NeighborhoodRepository } from '../../repositories/neighborhood.repository'

type ListNeighborhoodsServiceResponse = FailureOrSuccess<
  null,
  PaginatedResponse<Neighborhood>
>

@Injectable()
export class ListNeighborhoodsService {
  constructor(private repository: NeighborhoodRepository) {}

  async execute(params: PaginationParams): Promise<ListNeighborhoodsServiceResponse> {
    const result = await this.repository.findAll(params)

    return success(result)
  }
}
