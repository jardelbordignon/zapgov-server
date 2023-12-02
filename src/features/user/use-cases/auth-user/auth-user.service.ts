import { Injectable } from '@nestjs/common'

import type { AuthUserData } from 'src/contracts/account'

import { UserRepository } from '../../repositories/user.repository'

type AuthUserServiceResponse = any // FailureOrSuccess<UserAlreadyExistsError, void>

@Injectable()
export class AuthUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(data: AuthUserData): Promise<AuthUserServiceResponse> {
    const user = await this.userRepository.findByEmail(data.email)

    if (!user) {
      return
    }

    const accessToken = user.id

    return { accessToken }
  }
}
