import { Injectable } from '@nestjs/common'

import type { CreateCityHallData } from 'src/contracts/city-halls'
import { FileStorage } from 'src/infra/providers/file-storage/file-storage'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { CityHallRepository } from '../../repositories/city-hall.repository'
import { CityHallLocaleType } from '../../shared/locales/type'
import { CityHallAlreadyExistsError } from '../errors'

type CreateCityHallServiceResponse = FailureOrSuccess<
  CityHallAlreadyExistsError,
  void
>

@Injectable()
export class CreateCityHallService {
  constructor(
    private repository: CityHallRepository,
    private fileStorage: FileStorage,
    private i18n: I18n
  ) {}

  async execute(
    data: CreateCityHallData,
    file?: Express.Multer.File
  ): Promise<CreateCityHallServiceResponse> {
    if (data.email) {
      const cityHallWithSameEmail = await this.repository.findByEmail(data.email)

      if (cityHallWithSameEmail) {
        if (file) await this.fileStorage.destroyTmpFile(file.filename)
        return failure(
          new CityHallAlreadyExistsError(
            this.i18n.t<CityHallLocaleType>('cityHallWithSameEmail', data.email)
          )
        )
      }
    }

    const cityHallWithSameSlug = await this.repository.findBySlug(data.slug)

    if (cityHallWithSameSlug) {
      if (file) await this.fileStorage.destroyTmpFile(file.filename)
      return failure(
        new CityHallAlreadyExistsError(
          this.i18n.t<CityHallLocaleType>('cityHallWithSameSlug', data.slug)
        )
      )
    }

    const cityHall = await this.repository.create(data)

    if (file) await this.fileStorage.store(file, `city-halls/${cityHall.id}`)

    return success(undefined)
  }
}
