import { Injectable } from '@nestjs/common'
import type { SubCityHall } from '@prisma/client'

import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'

type ListSubCityHallsServiceResponse = FailureOrSuccess<
  null,
  PaginatedResponse<SubCityHall>
>

@Injectable()
export class ListSubCityHallsService {
  constructor(private repository: SubCityHallRepository) {}

  async execute(params?: PaginationParams): Promise<ListSubCityHallsServiceResponse> {
    const result = await this.repository.findAll(params)

    return success(result)
  }
}
