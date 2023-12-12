import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { NeighborhoodEntity } from '../../neighborhood.entity'
import { NEIGHBORHOODS_URL } from '../constants'
import { NeighborhoodNotFoundError } from '../errors'

import {
  ShowNeighborhoodService,
  ShowNeighborhoodServiceResponse,
} from './show-neighborhood.service'

@Controller(NEIGHBORHOODS_URL)
export class ShowNeighborhoodController {
  constructor(private showNeighborhoodService: ShowNeighborhoodService) {}

  private handleResult(result: ShowNeighborhoodServiceResponse) {
    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case NeighborhoodNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }

  @ApiTags('Neighborhood')
  @ApiBearerAuth()
  @ApiResponse({
    description: 'A neighborhood',
    status: 200,
    type: NeighborhoodEntity,
  })
  @ApiResponse({
    description: 'When a neighborhood is not found',
    schema: { example: new NeighborhoodNotFoundError() },
    status: 404,
  })
  @Get('/:id')
  async handle(@Param('id') NeighborhoodId: string): Promise<NeighborhoodEntity> {
    const result = await this.showNeighborhoodService.execute(NeighborhoodId)
    return this.handleResult(result)
  }
}
