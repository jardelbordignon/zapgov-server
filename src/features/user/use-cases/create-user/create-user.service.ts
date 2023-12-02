import { Injectable } from '@nestjs/common'

import type { CreateUserData } from 'src/contracts/account'
import { Hasher } from 'src/infra/cryptography/hasher/hasher'

import { UserRepository } from '../../repositories/user.repository'

type CreateUserServiceResponse = any // FailureOrSuccess<UserAlreadyExistsError, void>

@Injectable()
export class CreateUserService {
  constructor(
    private userRepository: UserRepository,
    private hasher: Hasher
  ) {}

  async execute(data: CreateUserData): Promise<CreateUserServiceResponse> {
    const userWithSameEmail = await this.userRepository.findByEmail(data.email)

    if (userWithSameEmail) {
      return `User with email address ${data.email} already exists.`
    }

    data.password = await this.hasher.hash(data.password)

    return this.userRepository.create(data)
  }
}
