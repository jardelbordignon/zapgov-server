import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'
import {
  ApiPaginatedResponse,
  PaginatedResponse,
  PaginationParams,
  PaginationQuery,
} from 'src/infra/providers/pagination'

import { CityHallEntity } from '../../city-hall.entity'
import { CITY_HALLS_URL } from '../../shared/constants'

import { ListCityHallsService } from './list-city-halls.service'

@AllowUnauthenticated()
@Controller(CITY_HALLS_URL)
export class ListCityHallsController {
  constructor(private listCityHallsService: ListCityHallsService) {}

  @ApiTags('CityHall')
  @ApiPaginatedResponse(CityHallEntity, {
    description: 'A list of city-halls (active or deleted)',
  })
  @Get()
  async handle(
    @PaginationQuery() params: PaginationParams
  ): Promise<PaginatedResponse<CityHallEntity>> {
    const result = await this.listCityHallsService.execute(params)

    if (!result.value) return new PaginatedResponse()

    return result.value
  }
}
