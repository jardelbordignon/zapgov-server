import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
  ApiListResponse,
  ListParams,
  ListQuery,
  ListResponse,
} from 'src/infra/providers/list'

import { WA_ACCOUNT_URL } from '../../shared/constants'
import { WaAccountEntity } from '../../wa-account.entity'

import { ListWaAccountsService } from './list-wa-accounts.service'

@Controller(WA_ACCOUNT_URL)
export class ListWaAccountsController {
  constructor(private listWaAccountsService: ListWaAccountsService) {}

  @ApiTags('WaAccount')
  @ApiListResponse(WaAccountEntity, {
    description: 'A list of whatsapp accounts (active or deleted)',
  })
  @Get()
  async handle(
    @ListQuery() params: ListParams
  ): Promise<ListResponse<WaAccountEntity>> {
    const result = await this.listWaAccountsService.execute(params)

    if (!result.value) return new ListResponse()

    return result.value
  }
}
