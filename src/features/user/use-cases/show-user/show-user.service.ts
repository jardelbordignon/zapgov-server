import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'

import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
import { UserNotFoundError } from '../errors'

type ShowUserServiceResponse = FailureOrSuccess<UserNotFoundError, User>

@Injectable()
export class ShowUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string): Promise<ShowUserServiceResponse> {
    const user = await this.userRepository.findById(id)

    if (!user) {
      return failure(new UserNotFoundError())
    }

    return success(user)
  }
}
