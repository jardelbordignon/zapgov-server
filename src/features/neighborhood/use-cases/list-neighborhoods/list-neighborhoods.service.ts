import { Injectable } from '@nestjs/common'
import type { Neighborhood } from '@prisma/client'

import { ListParams, ListResponse } from 'src/infra/providers/list'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { NeighborhoodRepository } from '../../repositories/neighborhood.repository'

type ListNeighborhoodsServiceResponse = FailureOrSuccess<
  null,
  ListResponse<Neighborhood>
>

@Injectable()
export class ListNeighborhoodsService {
  constructor(private repository: NeighborhoodRepository) {}

  async execute(params?: ListParams): Promise<ListNeighborhoodsServiceResponse> {
    const result = await this.repository.findAll(params)

    return success(result)
  }
}
