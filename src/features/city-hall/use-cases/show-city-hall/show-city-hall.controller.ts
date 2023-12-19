import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  applyDecorators,
} from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'

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
    }),
    ApiResponse({
      description: 'When a city hall is not found',
      schema: { example: new CityHallNotFoundError() },
      status: 404,
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

  @AllowUnauthenticated()
  @ShowCityHallApiDecorators()
  @Get('/slug/:slug')
  async handleBySlug(
    @Param('slug') cityHallSlug: string,
    @Query('add') add: string
  ): Promise<CityHallEntity> {
    const result = await this.showCityHallService.executeBySlug(cityHallSlug, add)
    return this.handleResult(result)
  }

  @ShowCityHallApiDecorators()
  @Get('/:id')
  async handle(
    @Param('id') cityHallId: string,
    @Query('add') add: string
  ): Promise<CityHallEntity> {
    const result = await this.showCityHallService.execute(cityHallId, add)
    return this.handleResult(result)
  }
}
