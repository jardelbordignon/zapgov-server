import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'

import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'

type ListUsersServiceResponse = FailureOrSuccess<null, PaginatedResponse<User>>

@Injectable()
export class ListUsersService {
  constructor(private userRepository: UserRepository) {}

  async execute(params: PaginationParams): Promise<ListUsersServiceResponse> {
    const result = await this.userRepository.findAll(params)

    return success(result)
  }
}
