import { Injectable } from '@nestjs/common'
import type { CityHall } from '@prisma/client'

import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import {
  CityHallInclude,
  CityHallRepository,
} from '../../repositories/city-hall.repository'
import { CityHallLocaleType } from '../../shared/locales/type'
import { CityHallNotFoundError } from '../errors'

export type ShowCityHallServiceResponse = FailureOrSuccess<
  CityHallNotFoundError,
  CityHall
>

@Injectable()
export class ShowCityHallService {
  constructor(
    private repository: CityHallRepository,
    private i18n: I18n
  ) {}

  private async handleExecute(
    method: 'findBySlug' | 'findById',
    param: string,
    includes?: string
  ): Promise<ShowCityHallServiceResponse> {
    const validIncludes: { [K in keyof Omit<CityHallInclude, '_count'>]?: K } = {
      neighborhoods: 'neighborhoods',
      sub_city_halls: 'sub_city_halls',
    }

    let include: CityHallInclude = {}

    if (typeof includes === 'string') {
      for (const item of includes?.split(',')) {
        if (item in validIncludes) {
          include = {
            ...include,
            [validIncludes[item]]: true,
          }
        }
      }
    }

    const cityHall = await this.repository[method](param, include)

    if (!cityHall) {
      return failure(
        new CityHallNotFoundError(this.i18n.t<CityHallLocaleType>('cityHallNotFound'))
      )
    }

    return success(cityHall)
  }

  async executeBySlug(
    slug: string,
    includes?: string
  ): Promise<ShowCityHallServiceResponse> {
    return this.handleExecute('findBySlug', slug, includes)
  }

  async execute(id: string, includes?: string): Promise<ShowCityHallServiceResponse> {
    return this.handleExecute('findById', id, includes)
  }
}
