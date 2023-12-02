import { Injectable } from '@nestjs/common'

import type { AuthUserData } from 'src/contracts/account'
import { Encrypter } from 'src/infra/cryptography/encrypter/encrypter'
import { Hasher } from 'src/infra/cryptography/hasher/hasher'

import { UserRepository } from '../../repositories/user.repository'

type AuthUserServiceResponse = any // FailureOrSuccess<UserAlreadyExistsError, void>

@Injectable()
export class AuthUserService {
  constructor(
    private userRepository: UserRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) {}

  async execute(data: AuthUserData): Promise<AuthUserServiceResponse> {
    const user = await this.userRepository.findByEmail(data.email)

    if (!user) {
      return
    }

    const matchPassword = await this.hasher.compare(data.password, user.password)

    if (!matchPassword) {
      return 'password mismatch'
    }

    const accessToken = await this.encrypter.encrypt({ sub: user.id })

    return { accessToken }
  }
}
