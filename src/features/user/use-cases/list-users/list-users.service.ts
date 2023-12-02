import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'

import {
  FailureOrSuccess,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'

type ListUsersServiceResponse = FailureOrSuccess<null, User[]>

@Injectable()
export class ListUsersService {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<ListUsersServiceResponse> {
    const users = await this.userRepository.findAll()

    return success(users)
  }
}
