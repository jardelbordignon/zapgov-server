import { Injectable } from '@nestjs/common'
import type { CityHall } from '@prisma/client'

import { PaginatedResponse } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { CityHallRepository } from '../../repositories/city-hall.repository'

type ListCityHallsServiceResponse = FailureOrSuccess<
  null,
  PaginatedResponse<CityHall>
>

type Props = {
  deleted?: boolean
  page: number
  perPage: number
  searchTerm?: string
}

@Injectable()
export class ListCityHallsService {
  constructor(private repository: CityHallRepository) {}

  async execute({
    deleted,
    page,
    perPage,
    searchTerm,
  }: Props): Promise<ListCityHallsServiceResponse> {
    const method = deleted ? 'findAllDeleted' : 'findAll'
    const result = await this.repository[method]({ page, perPage, searchTerm })

    return success(result)
  }
}
