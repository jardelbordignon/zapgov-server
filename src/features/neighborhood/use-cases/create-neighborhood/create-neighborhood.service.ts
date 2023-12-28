import { Injectable } from '@nestjs/common'

import type { CreateNeighborhoodData } from 'src/contracts/neighborhoods'
import { CityHallRepository } from 'src/features/city-hall/repositories/city-hall.repository'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { SubCityHallRepository } from 'src/features/sub-city-hall/repositories/sub-city-hall.repository'
import { SubCityHallNotFoundError } from 'src/features/sub-city-hall/use-cases/errors'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { NeighborhoodRepository } from '../../repositories/neighborhood.repository'
import { NeighborhoodAlreadyExistsError } from '../errors'

type CreateNeighborhoodServiceResponse = FailureOrSuccess<
  NeighborhoodAlreadyExistsError,
  void
>

@Injectable()
export class CreateNeighborhoodService {
  constructor(
    private neighborhoodRepository: NeighborhoodRepository,
    private cityHallRepository: CityHallRepository,
    private subCityHallRepository: SubCityHallRepository,
    private i18n: I18n
  ) {}

  async execute(
    data: CreateNeighborhoodData
  ): Promise<CreateNeighborhoodServiceResponse> {
    const { city_hall_id, name, sub_city_hall_id } = data

    const cityHall = await this.cityHallRepository.findById(city_hall_id)

    if (!cityHall) {
      return failure(new CityHallNotFoundError(this.i18n.t('cityHallNotFound')))
    }

    const subCityHall = await this.subCityHallRepository.findById(sub_city_hall_id)

    if (!subCityHall) {
      return failure(new SubCityHallNotFoundError(this.i18n.t('subCityHallNotFound')))
    }

    const neighborhoodWithSameName =
      await this.neighborhoodRepository.findByName(name)

    if (
      neighborhoodWithSameName &&
      neighborhoodWithSameName.sub_city_hall_id === sub_city_hall_id
    ) {
      return failure(
        new NeighborhoodAlreadyExistsError(
          this.i18n.t('neighborhoodWithSameName', name)
        )
      )
    }

    await this.neighborhoodRepository.create(data)

    return success(undefined)
  }
}
