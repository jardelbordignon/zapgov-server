import { Injectable } from '@nestjs/common'
import type { CityHall } from '@prisma/client'

import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { CityHallRepository } from '../../repositories/city-hall.repository'

type ListCityHallsServiceResponse = FailureOrSuccess<
  null,
  PaginatedResponse<CityHall>
>

@Injectable()
export class ListCityHallsService {
  constructor(private repository: CityHallRepository) {}

  async execute(params: PaginationParams): Promise<ListCityHallsServiceResponse> {
    const result = await this.repository.findAll(params)

    return success(result)
  }
}
