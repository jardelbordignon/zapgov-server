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
  deleted: boolean
  page: number
  perPage: number
}

@Injectable()
export class ListCityHallsService {
  constructor(private repository: CityHallRepository) {}

  async execute({
    deleted,
    page,
    perPage,
  }: Props): Promise<ListCityHallsServiceResponse> {
    const result = deleted
      ? await this.repository.findAllDeleted({ page, perPage })
      : await this.repository.findAll({ page, perPage })

    return success(result)
  }
}
