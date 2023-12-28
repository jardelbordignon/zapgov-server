import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { NEIGHBORHOODS_URL } from '../../shared/constants'
import { NeighborhoodNotFoundError } from '../errors'

import { DeleteNeighborhoodService } from './delete-neighborhood.service'

@ApiTags('Neighborhood')
@Controller(NEIGHBORHOODS_URL)
export class DeleteNeighborhoodController {
  constructor(private deleteNeighborhoodService: DeleteNeighborhoodService) {}

  @HttpCode(204)
  @ApiBearerAuth()
  @ApiResponse({ description: 'Neighborhood deleted successful', status: 204 })
  @ApiResponse({
    description: 'When neighborhood not found',
    schema: { example: new NeighborhoodNotFoundError() },
    status: 404,
  })
  @Delete('/:id')
  async handleDeleteById(
    @Param('id') neighborhoodId: string,
    @Query('soft') soft: boolean
  ): Promise<void> {
    const result = await this.deleteNeighborhoodService.execute(neighborhoodId, soft)

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
}
