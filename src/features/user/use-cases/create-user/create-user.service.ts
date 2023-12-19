import { Injectable } from '@nestjs/common'

import type { CreateUserData } from 'src/contracts/account'
import { Hasher } from 'src/infra/providers/cryptography/hasher/hasher'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
import { UserAlreadyExistsError } from '../errors'

type CreateUserServiceResponse = FailureOrSuccess<UserAlreadyExistsError, void>

@Injectable()
export class CreateUserService {
  constructor(
    private userRepository: UserRepository,
    private hasher: Hasher
  ) {}

  async execute(data: CreateUserData): Promise<CreateUserServiceResponse> {
    const userWithSameEmail = await this.userRepository.findByEmail(data.email)

    if (userWithSameEmail) {
      return failure(
        new UserAlreadyExistsError(
          `User with ${data.email} email address already exists.`
        )
      )
    }

    data.password = await this.hasher.hash(data.password)

    return success(await this.userRepository.create(data))
  }
}
