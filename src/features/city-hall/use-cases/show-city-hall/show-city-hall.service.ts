import { Injectable } from '@nestjs/common'
import type { CityHall } from '@prisma/client'

import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { CityHallRepository } from '../../repositories/city-hall.repository'
import { CityHallNotFoundError } from '../errors'

export type ShowCityHallServiceResponse = FailureOrSuccess<
  CityHallNotFoundError,
  CityHall
>

@Injectable()
export class ShowCityHallService {
  constructor(private repository: CityHallRepository) {}

  async executeBySlug(slug: string): Promise<ShowCityHallServiceResponse> {
    const user = await this.repository.findBySlug(slug)

    if (!user) {
      return failure(new CityHallNotFoundError())
    }

    return success(user)
  }

  async execute(id: string): Promise<ShowCityHallServiceResponse> {
    const user = await this.repository.findById(id)

    if (!user) {
      return failure(new CityHallNotFoundError())
    }

    return success(user)
  }
}
