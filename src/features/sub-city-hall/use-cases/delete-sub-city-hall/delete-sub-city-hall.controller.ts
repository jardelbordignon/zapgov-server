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

import { SUB_CITY_HALLS_URL } from '../constants'
import { SubCityHallNotFoundError } from '../errors'

import { DeleteSubCityHallService } from './delete-sub-city-hall.service'

@ApiTags('SubCityHall')
@Controller(SUB_CITY_HALLS_URL)
export class DeleteSubCityHallController {
  constructor(private deleteSubCityHallService: DeleteSubCityHallService) {}

  @HttpCode(204)
  @ApiBearerAuth()
  @ApiResponse({ description: 'SubCityHall deleted successful', status: 204 })
  @ApiResponse({
    description: 'When city hall not found',
    schema: { example: new SubCityHallNotFoundError() },
    status: 404,
  })
  @Delete('/:id')
  async handleDeleteById(
    @Param('id') subSubCityHallId: string,
    @Query('soft') soft: boolean
  ): Promise<void> {
    const result = await this.deleteSubCityHallService.execute(subSubCityHallId, soft)

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case SubCityHallNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
