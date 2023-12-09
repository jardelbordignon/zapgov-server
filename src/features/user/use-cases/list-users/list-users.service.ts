import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'

import { PaginatedResponse } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'

type ListUsersServiceResponse = FailureOrSuccess<null, PaginatedResponse<User>>

type Props = {
  deleted?: boolean
  page: number
  perPage: number
  searchTerm?: string
}

@Injectable()
export class ListUsersService {
  constructor(private userRepository: UserRepository) {}

  async execute({
    deleted,
    page,
    perPage,
    searchTerm,
  }: Props): Promise<ListUsersServiceResponse> {
    const method = deleted ? 'findAllDeleted' : 'findAll'
    const result = await this.userRepository[method]({ page, perPage, searchTerm })

    return success(result)
  }
}
