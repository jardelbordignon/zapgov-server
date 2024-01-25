import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'
import {
  ApiListResponse,
  ListParams,
  ListQuery,
  ListResponse,
} from 'src/infra/providers/list'

import { NeighborhoodEntity } from '../../neighborhood.entity'
import { NEIGHBORHOODS_URL } from '../../shared/constants'

import { ListNeighborhoodsService } from './list-neighborhoods.service'

@AllowUnauthenticated()
@Controller(NEIGHBORHOODS_URL)
export class ListNeighborhoodsController {
  constructor(private listNeighborhoodsService: ListNeighborhoodsService) {}

  @ApiTags('Neighborhood')
  @ApiListResponse(NeighborhoodEntity, {
    description: 'A list of neighborhoods (active or deleted)',
  })
  @Get()
  async handle(
    @ListQuery() params: ListParams
  ): Promise<ListResponse<NeighborhoodEntity>> {
    const result = await this.listNeighborhoodsService.execute(params)

    if (!result.value) return new ListResponse()

    return result.value
  }
}
