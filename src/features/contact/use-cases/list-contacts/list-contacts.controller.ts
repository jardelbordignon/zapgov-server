import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AllowUnauthenticated } from 'src/infra/providers/auth/authentication.guard'
import {
  ApiPaginatedResponse,
  PaginatedResponse,
  PaginationParams,
  PaginationQuery,
} from 'src/infra/providers/pagination'

import { ContactEntity } from '../../contact.entity'
import { CONTACTS_URL } from '../../shared/constants'

import { ListContactsService } from './list-contacts.service'

@AllowUnauthenticated()
@Controller(CONTACTS_URL)
export class ListContactsController {
  constructor(private listContactsService: ListContactsService) {}

  @ApiTags('Contact')
  @ApiPaginatedResponse(ContactEntity, {
    description: 'A list of contacts (active or deleted)',
  })
  @Get()
  async handle(
    @PaginationQuery() params: PaginationParams
  ): Promise<PaginatedResponse<ContactEntity>> {
    const result = await this.listContactsService.execute(params)

    if (!result.value) return new PaginatedResponse()

    return result.value
  }
}
