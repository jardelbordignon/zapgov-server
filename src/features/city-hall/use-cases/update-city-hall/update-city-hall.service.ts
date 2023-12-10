import { Injectable } from '@nestjs/common'
import type { CityHall } from '@prisma/client'

import type { UpdateCityHallData } from 'src/contracts/city-halls'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { CityHallRepository } from '../../repositories/city-hall.repository'
import { CityHallAlreadyExistsError, CityHallNotFoundError } from '../errors'

export type UpdateCityHallServiceResponse = FailureOrSuccess<
  CityHallNotFoundError | CityHallAlreadyExistsError,
  CityHall
>

@Injectable()
export class UpdateCityHallService {
  constructor(private repository: CityHallRepository) {}

  async execute(
    cityHallId: string,
    data: UpdateCityHallData
  ): Promise<UpdateCityHallServiceResponse> {
    const cityHall = await this.repository.findById(cityHallId)

    if (!cityHall) {
      return failure(new CityHallNotFoundError())
    }

    if (data.email && data.email !== cityHall.email) {
      const cityHallWithSameEmail = await this.repository.findByEmail(data.email)

      if (cityHallWithSameEmail) {
        return failure(
          new CityHallAlreadyExistsError(
            `CityHall with ${data.email} email address already exists.`
          )
        )
      }
    }

    if (data.slug && data.slug !== cityHall.slug) {
      const cityHallWithSameSlug = await this.repository.findBySlug(data.slug)

      if (cityHallWithSameSlug) {
        return failure(
          new CityHallAlreadyExistsError(
            `CityHall with ${data.slug} slug already exists.`
          )
        )
      }
    }

    const updatedCityHall = await this.repository.update(cityHallId, data)

    return success(updatedCityHall)
  }
}
