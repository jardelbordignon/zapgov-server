import { Injectable } from '@nestjs/common'
import type { Contact } from '@prisma/client'

import { ListParams, ListResponse } from 'src/infra/providers/list'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { ContactRepository } from '../../repositories/contact.repository'

type ListContactsServiceResponse = FailureOrSuccess<null, ListResponse<Contact>>

@Injectable()
export class ListContactsService {
  constructor(private repository: ContactRepository) {}

  async execute(params?: ListParams): Promise<ListContactsServiceResponse> {
    const result = await this.repository.findAll(params)

    return success(result)
  }
}
