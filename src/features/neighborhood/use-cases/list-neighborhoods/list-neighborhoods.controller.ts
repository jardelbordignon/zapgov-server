import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'
import {
  ApiPaginatedResponse,
  PaginatedResponse,
  PaginationParams,
  PaginationQuery,
} from 'src/infra/providers/pagination'

import { NeighborhoodEntity } from '../../neighborhood.entity'
import { NEIGHBORHOODS_URL } from '../../shared/constants'

import { ListNeighborhoodsService } from './list-neighborhoods.service'

@AllowUnauthenticated()
@Controller(NEIGHBORHOODS_URL)
export class ListNeighborhoodsController {
  constructor(private listNeighborhoodsService: ListNeighborhoodsService) {}

  @ApiTags('Neighborhood')
  @ApiPaginatedResponse(NeighborhoodEntity, {
    description: 'A list of neighborhoods (active or deleted)',
  })
  @Get()
  async handle(
    @PaginationQuery() params: PaginationParams
  ): Promise<PaginatedResponse<NeighborhoodEntity>> {
    const result = await this.listNeighborhoodsService.execute(params)

    if (!result.value) return new PaginatedResponse()

    return result.value
  }
}
