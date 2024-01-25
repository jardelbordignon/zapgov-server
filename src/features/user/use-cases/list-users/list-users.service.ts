import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'

import { ListParams, ListResponse } from 'src/infra/providers/list'
import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'

type ListUsersServiceResponse = FailureOrSuccess<null, ListResponse<User>>

@Injectable()
export class ListUsersService {
  constructor(private userRepository: UserRepository) {}

  async execute(params: ListParams): Promise<ListUsersServiceResponse> {
    const result = await this.userRepository.findAll(params)

    return success(result)
  }
}
