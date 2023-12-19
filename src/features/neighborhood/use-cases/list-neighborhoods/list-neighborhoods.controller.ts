import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'
import {
  ApiPaginatedResponse,
  PaginatedResponse,
} from 'src/infra/providers/pagination/pagination.decorator'

import { NeighborhoodEntity } from '../../neighborhood.entity'
import { NEIGHBORHOODS_URL } from '../constants'

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
    @Query('deleted') deleted: boolean,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') searchTerm?: string
  ): Promise<PaginatedResponse<NeighborhoodEntity>> {
    page = Number(page || 1)
    perPage = Number(perPage || 20)
    const result = await this.listNeighborhoodsService.execute({
      deleted,
      page,
      perPage,
      searchTerm,
    })

    if (!result.value) return new PaginatedResponse()

    return result.value
  }
}
