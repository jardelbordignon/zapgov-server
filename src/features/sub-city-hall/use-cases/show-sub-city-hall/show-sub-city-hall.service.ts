import { Injectable } from '@nestjs/common'
import type { SubCityHall } from '@prisma/client'

import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import { SubCityHallNotFoundError } from '../errors'

export type ShowSubCityHallServiceResponse = FailureOrSuccess<
  SubCityHallNotFoundError,
  SubCityHall
>

@Injectable()
export class ShowSubCityHallService {
  constructor(private repository: SubCityHallRepository) {}

  async execute(id: string): Promise<ShowSubCityHallServiceResponse> {
    const subCityHall = await this.repository.findById(id)

    if (!subCityHall) {
      return failure(new SubCityHallNotFoundError())
    }

    return success(subCityHall)
  }
}
