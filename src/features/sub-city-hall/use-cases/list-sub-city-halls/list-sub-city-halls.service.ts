import { Injectable } from '@nestjs/common'
import type { SubCityHall } from '@prisma/client'

import { ListParams, ListResponse } from 'src/infra/providers/list'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'

type ListSubCityHallsServiceResponse = FailureOrSuccess<
  null,
  ListResponse<SubCityHall>
>

@Injectable()
export class ListSubCityHallsService {
  constructor(private repository: SubCityHallRepository) {}

  async execute(params?: ListParams): Promise<ListSubCityHallsServiceResponse> {
    const result = await this.repository.findAll(params)

    return success(result)
  }
}
