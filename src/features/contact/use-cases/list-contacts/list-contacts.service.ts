import { Injectable } from '@nestjs/common'
import type { Contact } from '@prisma/client'

import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { ContactRepository } from '../../repositories/contact.repository'

type ListContactsServiceResponse = FailureOrSuccess<null, PaginatedResponse<Contact>>

@Injectable()
export class ListContactsService {
  constructor(private repository: ContactRepository) {}

  async execute(params?: PaginationParams): Promise<ListContactsServiceResponse> {
    const result = await this.repository.findAll(params)

    return success(result)
  }
}
