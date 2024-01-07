import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { SUB_CITY_HALLS_URL } from '../../shared/constants'
import { SubCityHallEntity } from '../../sub-city-hall.entity'
import { SubCityHallNotFoundError } from '../errors'

import {
  ShowSubCityHallService,
  ShowSubCityHallServiceResponse,
} from './show-sub-city-hall.service'

@Controller(SUB_CITY_HALLS_URL)
export class ShowSubCityHallController {
  constructor(private showSubCityHallService: ShowSubCityHallService) {}

  private handleResult(result: ShowSubCityHallServiceResponse) {
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

  @ApiTags('SubCityHall')
  @ApiBearerAuth()
  @ApiResponse({
    description: 'A sub city hall',
    status: 200,
    type: SubCityHallEntity,
  })
  @ApiResponse({
    description: 'When a sub city hall is not found',
    schema: { example: new SubCityHallNotFoundError() },
    status: 404,
  })
  @Get('/:id')
  async handle(@Param('id') SubCityHallId: string): Promise<SubCityHallEntity> {
    const result = await this.showSubCityHallService.execute(SubCityHallId)
    return this.handleResult(result)
  }
}
