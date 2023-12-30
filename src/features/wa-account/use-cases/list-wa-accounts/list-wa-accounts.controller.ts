import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
  ApiPaginatedResponse,
  PaginatedResponse,
  PaginationParams,
  PaginationQuery,
} from 'src/infra/providers/pagination'

import { WA_ACCOUNT_URL } from '../../shared/constants'
import { WaAccountEntity } from '../../wa-account.entity'

import { ListWaAccountsService } from './list-wa-accounts.service'

@Controller(WA_ACCOUNT_URL)
export class ListWaAccountsController {
  constructor(private listWaAccountsService: ListWaAccountsService) {}

  @ApiTags('WaAccount')
  @ApiPaginatedResponse(WaAccountEntity, {
    description: 'A list of whatsapp accounts (active or deleted)',
  })
  @Get()
  async handle(
    @PaginationQuery() params: PaginationParams
  ): Promise<PaginatedResponse<WaAccountEntity>> {
    const result = await this.listWaAccountsService.execute(params)

    if (!result.value) return new PaginatedResponse()

    return result.value
  }
}
