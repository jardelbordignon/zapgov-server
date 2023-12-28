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

import { CITY_HALLS_URL } from '../../shared/constants'
import { CityHallNotFoundError } from '../errors'

import { DeleteCityHallService } from './delete-city-hall.service'

@ApiTags('CityHall')
@Controller(CITY_HALLS_URL)
export class DeleteCityHallController {
  constructor(private deleteCityHallService: DeleteCityHallService) {}

  @HttpCode(204)
  @ApiBearerAuth()
  @ApiResponse({ description: 'CityHall deleted successful', status: 204 })
  @ApiResponse({
    description: 'When city hall not found',
    schema: { example: new CityHallNotFoundError() },
    status: 404,
  })
  @Delete('/:id')
  async handleDeleteById(
    @Param('id') cityHallId: string,
    @Query('soft') soft: boolean
  ): Promise<void> {
    const result = await this.deleteCityHallService.execute(cityHallId, soft)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case CityHallNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
