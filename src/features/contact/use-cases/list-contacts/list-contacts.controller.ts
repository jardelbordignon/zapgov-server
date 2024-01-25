import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'
import {
  ApiListResponse,
  ListParams,
  ListQuery,
  ListResponse,
} from 'src/infra/providers/list'

import { ContactEntity } from '../../contact.entity'
import { CONTACTS_URL } from '../../shared/constants'

import { ListContactsService } from './list-contacts.service'

@AllowUnauthenticated()
@Controller(CONTACTS_URL)
export class ListContactsController {
  constructor(private listContactsService: ListContactsService) {}

  @ApiTags('Contact')
  @ApiListResponse(ContactEntity, {
    description: 'A list of contacts (active or deleted)',
  })
  @Get()
  async handle(
    @ListQuery() params: ListParams
  ): Promise<ListResponse<ContactEntity>> {
    const result = await this.listContactsService.execute(params)

    if (!result.value) return new ListResponse()

    return result.value
  }
}
