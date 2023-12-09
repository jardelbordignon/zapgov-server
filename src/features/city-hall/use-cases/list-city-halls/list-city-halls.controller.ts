import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/auth/authentication.guard'
import {
  ApiPaginatedResponse,
  PaginatedResponse,
} from 'src/infra/providers/pagination/pagination.decorator'

import { CityHallEntity } from '../../city-hall.entity'
import { CITY_HALLS_URL } from '../constants'

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
    @Query('deleted') deleted: boolean,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') searchTerm?: string
  ): Promise<PaginatedResponse<CityHallEntity>> {
    page = +page || 1
    perPage = +perPage || 20
    const result = await this.listCityHallsService.execute({
      deleted,
      page,
      perPage,
      searchTerm,
    })

    return result.value
  }
}
