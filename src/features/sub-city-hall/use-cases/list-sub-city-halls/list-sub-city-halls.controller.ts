import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'
import {
  ApiPaginatedResponse,
  PaginatedResponse,
} from 'src/infra/providers/pagination/pagination.decorator'

import { SubCityHallEntity } from '../../sub-city-hall.entity'
import { SUB_CITY_HALLS_URL } from '../constants'

import { ListSubCityHallsService } from './list-sub-city-halls.service'

@AllowUnauthenticated()
@Controller(SUB_CITY_HALLS_URL)
export class ListSubCityHallsController {
  constructor(private listSubCityHallsService: ListSubCityHallsService) {}

  @ApiTags('SubCityHall')
  @ApiPaginatedResponse(SubCityHallEntity, {
    description: 'A list of sub-city-halls (active or deleted)',
  })
  @Get()
  async handle(
    @Query('deleted') deleted: boolean,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') searchTerm?: string
  ): Promise<PaginatedResponse<SubCityHallEntity>> {
    page = Number(page || 1)
    perPage = Number(perPage || 20)
    const result = await this.listSubCityHallsService.execute({
      deleted,
      page,
      perPage,
      searchTerm,
    })

    if (!result.value) return new PaginatedResponse()

    return result.value
  }
}
