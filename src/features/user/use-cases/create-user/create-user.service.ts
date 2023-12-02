import { Injectable } from '@nestjs/common'

import type { CreateUserData } from 'src/contracts/account'

import { UserRepository } from '../../repositories/user.repository'

type CreateUserServiceResponse = any // FailureOrSuccess<UserAlreadyExistsError, void>

@Injectable()
export class CreateUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(data: CreateUserData): Promise<CreateUserServiceResponse> {
    return this.userRepository.create(data)
  }
}
