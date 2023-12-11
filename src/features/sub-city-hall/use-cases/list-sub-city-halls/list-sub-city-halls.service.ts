import { Injectable } from '@nestjs/common'
import type { SubCityHall } from '@prisma/client'

import { PaginatedResponse } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'

type ListSubCityHallsServiceResponse = FailureOrSuccess<
  null,
  PaginatedResponse<SubCityHall>
>

type Props = {
  deleted?: boolean
  page: number
  perPage: number
  searchTerm?: string
}

@Injectable()
export class ListSubCityHallsService {
  constructor(private repository: SubCityHallRepository) {}

  async execute({
    deleted,
    page,
    perPage,
    searchTerm,
  }: Props): Promise<ListSubCityHallsServiceResponse> {
    const method = deleted ? 'findAllDeleted' : 'findAll'
    const result = await this.repository[method]({ page, perPage, searchTerm })

    return success(result)
  }
}
