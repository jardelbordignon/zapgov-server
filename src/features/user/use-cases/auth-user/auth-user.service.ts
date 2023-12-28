import { Injectable } from '@nestjs/common'

import type { AuthUserData, AuthUserResponse } from 'src/contracts/account'
import { Encrypter } from 'src/infra/providers/cryptography/encrypter/encrypter'
import { Hasher } from 'src/infra/providers/cryptography/hasher/hasher'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
import type { UserLocaleType } from '../../shared/locales/type'
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
    private encrypter: Encrypter,
    private i18n: I18n
  ) {}

  async execute(data: AuthUserData): Promise<AuthUserServiceResponse> {
    const user = await this.userRepository.findByEmail(data.email)

    if (!user) {
      return failure(
        new WrongCredentialsError(this.i18n.t<UserLocaleType>('wrongCredentials'))
      )
    }

    const matchPassword = await this.hasher.compare(data.password, user.password)

    if (!matchPassword) {
      return failure(
        new WrongCredentialsError(this.i18n.t<UserLocaleType>('wrongCredentials'))
      )
    }

    const accessToken = await this.encrypter.encrypt({
      roles: user.roles,
      sub: user.id,
    })

    return success({ accessToken, isAdmin: user.roles.includes('ADMIN') })
  }
}
