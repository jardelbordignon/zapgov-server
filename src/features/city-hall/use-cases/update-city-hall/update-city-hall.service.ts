import { Injectable } from '@nestjs/common'
import type { CityHall } from '@prisma/client'

import type { UpdateCityHallData } from 'src/contracts/city-halls'
import { FileStorage } from 'src/infra/providers/file-storage/file-storage'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { CityHallRepository } from '../../repositories/city-hall.repository'
import { CityHallLocaleType } from '../../shared/locales/type'
import { CityHallAlreadyExistsError, CityHallNotFoundError } from '../errors'

export type UpdateCityHallServiceResponse = FailureOrSuccess<
  CityHallNotFoundError | CityHallAlreadyExistsError,
  CityHall
>

@Injectable()
export class UpdateCityHallService {
  constructor(
    private repository: CityHallRepository,
    private fileStorage: FileStorage,
    private i18n: I18n
  ) {}

  async execute(
    cityHallId: string,
    data: UpdateCityHallData,
    file?: Express.Multer.File
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
            this.i18n.t<CityHallLocaleType>('cityHallWithSameEmail', data.email)
          )
        )
      }
    }

    if (data.slug && data.slug !== cityHall.slug) {
      const cityHallWithSameSlug = await this.repository.findBySlug(data.slug)

      if (cityHallWithSameSlug) {
        return failure(
          new CityHallAlreadyExistsError(
            `City hall with ${data.slug} slug already exists.`
          )
        )
      }
    }

    const updatedCityHall = await this.repository.update(cityHallId, data)

    if (file) await this.fileStorage.store(file, `city-halls/${cityHall.id}`)

    return success(updatedCityHall)
  }
}
