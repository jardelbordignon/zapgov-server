import { Injectable } from '@nestjs/common'

import type { CreateCityHallData } from 'src/contracts/city-halls'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { CityHallRepository } from '../../repositories/city-hall.repository'
import { CityHallAlreadyExistsError } from '../errors'

type CreateCityHallServiceResponse = FailureOrSuccess<
  CityHallAlreadyExistsError,
  void
>

@Injectable()
export class CreateCityHallService {
  constructor(private repository: CityHallRepository) {}

  async execute(data: CreateCityHallData): Promise<CreateCityHallServiceResponse> {
    const cityHallWithSameEmail = await this.repository.findByEmail(data.email)

    if (cityHallWithSameEmail) {
      return failure(
        new CityHallAlreadyExistsError(
          `CityHall with ${data.email} email address already exists.`
        )
      )
    }

    const cityHallWithSameSlug = await this.repository.findBySlug(data.slug)

    if (cityHallWithSameSlug) {
      return failure(
        new CityHallAlreadyExistsError(
          `CityHall with ${data.slug} slug already exists.`
        )
      )
    }

    return success(await this.repository.create(data))
  }
}
