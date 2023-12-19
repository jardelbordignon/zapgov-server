import { Injectable } from '@nestjs/common'

import type { CreateSubCityHallData } from 'src/contracts/sub-city-halls'
import { CityHallRepository } from 'src/features/city-hall/repositories/city-hall.repository'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import { SubCityHallAlreadyExistsError } from '../errors'

type CreateSubCityHallServiceResponse = FailureOrSuccess<
  SubCityHallAlreadyExistsError,
  void
>

@Injectable()
export class CreateSubCityHallService {
  constructor(
    private subCityHallRepository: SubCityHallRepository,
    private cityHallRepository: CityHallRepository
  ) {}

  async execute(
    data: CreateSubCityHallData
  ): Promise<CreateSubCityHallServiceResponse> {
    const cityHall = await this.cityHallRepository.findById(data.city_hall_id)

    if (!cityHall) {
      return failure(new CityHallNotFoundError())
    }

    if (data.email) {
      const subCityHallWithSameEmail = await this.subCityHallRepository.findByEmail(
        data.email
      )

      if (subCityHallWithSameEmail) {
        return failure(
          new SubCityHallAlreadyExistsError(
            `Sub city hall with ${data.email} email address already exists.`
          )
        )
      }
    }

    return success(await this.subCityHallRepository.create(data))
  }
}
