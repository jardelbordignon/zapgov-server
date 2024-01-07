import { Injectable } from '@nestjs/common'

import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { WaAccountRepository } from '../../repositories/wa-account.repository'
import { WaAccountEntity } from '../../wa-account.entity'

type ListWaAccountsServiceResponse = FailureOrSuccess<
  null,
  PaginatedResponse<WaAccountEntity>
>

@Injectable()
export class ListWaAccountsService {
  constructor(private repository: WaAccountRepository) {}

  async execute(params?: PaginationParams): Promise<ListWaAccountsServiceResponse> {
    const result = await this.repository.findAll(params)

    return success(result)
  }
}
