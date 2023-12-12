import { Injectable } from '@nestjs/common'
import type { Neighborhood } from '@prisma/client'

import { PaginatedResponse } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { NeighborhoodRepository } from '../../repositories/neighborhood.repository'

type ListNeighborhoodsServiceResponse = FailureOrSuccess<
  null,
  PaginatedResponse<Neighborhood>
>

type Props = {
  deleted?: boolean
  page: number
  perPage: number
  searchTerm?: string
}

@Injectable()
export class ListNeighborhoodsService {
  constructor(private repository: NeighborhoodRepository) {}

  async execute({
    deleted,
    page,
    perPage,
    searchTerm,
  }: Props): Promise<ListNeighborhoodsServiceResponse> {
    const method = deleted ? 'findAllDeleted' : 'findAll'
    const result = await this.repository[method]({ page, perPage, searchTerm })

    return success(result)
  }
}
