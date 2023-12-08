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
  deleted: boolean
  page: number
  perPage: number
}

@Injectable()
export class ListUsersService {
  constructor(private userRepository: UserRepository) {}

  async execute({
    deleted,
    page,
    perPage,
  }: Props): Promise<ListUsersServiceResponse> {
    const result = deleted
      ? await this.userRepository.findAllDeleted({ page, perPage })
      : await this.userRepository.findAll({ page, perPage })

    return success(result)
  }
}
