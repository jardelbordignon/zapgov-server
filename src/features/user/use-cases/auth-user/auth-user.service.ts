import { Injectable } from '@nestjs/common'

import type { AuthUserData, AuthUserResponse } from 'src/contracts/account'
import { Encrypter } from 'src/infra/cryptography/encrypter/encrypter'
import { Hasher } from 'src/infra/cryptography/hasher/hasher'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
import { WrongCredentialsError } from '../errors'

type AuthUserServiceResponse = FailureOrSuccess<
  WrongCredentialsError,
  AuthUserResponse
>
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
      return failure(new WrongCredentialsError())
    }

    const matchPassword = await this.hasher.compare(data.password, user.password)

    if (!matchPassword) {
      return failure(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      roles: user.roles,
      sub: user.id,
    })

    return success({ accessToken, isAdmin: user.roles.includes('ADMIN') })
  }
}
