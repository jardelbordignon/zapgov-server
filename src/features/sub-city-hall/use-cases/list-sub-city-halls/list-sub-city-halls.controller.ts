import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'
import {
  ApiPaginatedResponse,
  PaginatedResponse,
  PaginationParams,
  PaginationQuery,
} from 'src/infra/providers/pagination'

import { SUB_CITY_HALLS_URL } from '../../shared/constants'
import { SubCityHallEntity } from '../../sub-city-hall.entity'

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
    @PaginationQuery() params: PaginationParams
  ): Promise<PaginatedResponse<SubCityHallEntity>> {
    const result = await this.listSubCityHallsService.execute(params)

    if (!result.value) return new PaginatedResponse()

    return result.value
  }
}
