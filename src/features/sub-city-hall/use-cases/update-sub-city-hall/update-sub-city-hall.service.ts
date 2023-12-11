import { Injectable } from '@nestjs/common'
import type { SubCityHall } from '@prisma/client'

import type { UpdateSubCityHallData } from 'src/contracts/sub-city-halls'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import { SubCityHallAlreadyExistsError, SubCityHallNotFoundError } from '../errors'

export type UpdateSubCityHallServiceResponse = FailureOrSuccess<
  SubCityHallNotFoundError | SubCityHallAlreadyExistsError,
  SubCityHall
>

@Injectable()
export class UpdateSubCityHallService {
  constructor(private repository: SubCityHallRepository) {}

  async execute(
    subCityHallId: string,
    data: UpdateSubCityHallData
  ): Promise<UpdateSubCityHallServiceResponse> {
    const subCityHall = await this.repository.findById(subCityHallId)

    if (!subCityHall) {
      return failure(new SubCityHallNotFoundError())
    }

    if (data.email && data.email !== subCityHall.email) {
      const cityHallWithSameEmail = await this.repository.findByEmail(data.email)

      if (cityHallWithSameEmail) {
        return failure(
          new SubCityHallAlreadyExistsError(
            `Sub city hall with ${data.email} email address already exists.`
          )
        )
      }
    }

    const updatedSubCityHall = await this.repository.update(subCityHallId, data)

    return success(updatedSubCityHall)
  }
}
