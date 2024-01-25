import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'
import {
  ApiListResponse,
  ListParams,
  ListQuery,
  ListResponse,
} from 'src/infra/providers/list'

import { SUB_CITY_HALLS_URL } from '../../shared/constants'
import { SubCityHallEntity } from '../../sub-city-hall.entity'

import { ListSubCityHallsService } from './list-sub-city-halls.service'

@AllowUnauthenticated()
@Controller(SUB_CITY_HALLS_URL)
export class ListSubCityHallsController {
  constructor(private listSubCityHallsService: ListSubCityHallsService) {}

  @ApiTags('SubCityHall')
  @ApiListResponse(SubCityHallEntity, {
    description: 'A list of sub-city-halls (active or deleted)',
  })
  @Get()
  async handle(
    @ListQuery() params: ListParams
  ): Promise<ListResponse<SubCityHallEntity>> {
    const result = await this.listSubCityHallsService.execute(params)

    if (!result.value) return new ListResponse()

    return result.value
  }
}
