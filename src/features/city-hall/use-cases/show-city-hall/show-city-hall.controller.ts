import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  applyDecorators,
} from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CityHallEntity } from '../../city-hall.entity'
import { CITY_HALLS_URL } from '../constants'
import { CityHallNotFoundError } from '../errors'

import {
  ShowCityHallService,
  ShowCityHallServiceResponse,
} from './show-city-hall.service'

function ShowCityHallApiDecorators() {
  return applyDecorators(
    ApiTags('CityHall'),
    ApiBearerAuth(),
    ApiResponse({
      description: 'A city-hall',
      status: 200,
      type: CityHallEntity,
    })
  )
}

@Controller(CITY_HALLS_URL)
export class ShowCityHallController {
  constructor(private showCityHallService: ShowCityHallService) {}

  private handleResult(result: ShowCityHallServiceResponse) {
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

  @ShowCityHallApiDecorators()
  @Get('/slug/:slug')
  async handleBySlug(@Param('slug') cityHallSlug: string): Promise<CityHallEntity> {
    const result = await this.showCityHallService.executeBySlug(cityHallSlug)
    return this.handleResult(result)
  }

  @ShowCityHallApiDecorators()
  @Get('/:id')
  async handle(@Param('id') cityHallId: string): Promise<CityHallEntity> {
    const result = await this.showCityHallService.execute(cityHallId)
    return this.handleResult(result)
  }
}
