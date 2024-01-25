import { Injectable } from '@nestjs/common'
import type { CityHall } from '@prisma/client'

import { ListParams, ListResponse } from 'src/infra/providers/list'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { CityHallRepository } from '../../repositories/city-hall.repository'

type ListCityHallsServiceResponse = FailureOrSuccess<null, ListResponse<CityHall>>

@Injectable()
export class ListCityHallsService {
  constructor(private repository: CityHallRepository) {}

  async execute(params?: ListParams): Promise<ListCityHallsServiceResponse> {
    const result = await this.repository.findAll(params)

    return success(result)
  }
}
