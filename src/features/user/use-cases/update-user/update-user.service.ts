import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'

import type { UpdateUserData } from 'src/contracts/account'
import { Hasher } from 'src/infra/providers/cryptography/hasher/hasher'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
import type { UserLocaleType } from '../../shared/locales/type'
import {
  UnauthorizedToUpdateUserError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../errors'

export type UpdateUserServiceResponse = FailureOrSuccess<
  UserNotFoundError | UnauthorizedToUpdateUserError | UserAlreadyExistsError,
  User
>

@Injectable()
export class UpdateUserService {
  constructor(
    private userRepository: UserRepository,
    private hasher: Hasher,
    private i18n: I18n
  ) {}

  async execute(
    userId: string,
    data: UpdateUserData,
    isAdmin = false
  ): Promise<UpdateUserServiceResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return failure(new UserNotFoundError())
    }

    const { currentPassword, email, password } = data

    if (email || password) {
      if (!isAdmin) {
        if (!currentPassword) {
          return failure(
            new UnauthorizedToUpdateUserError(
              this.i18n.t<UserLocaleType>('currentPasswordRequired')
            )
          )
        }

        const matchPassword = await this.hasher.compare(
          currentPassword,
          user.password
        )

        if (!matchPassword) {
          return failure(
            new UnauthorizedToUpdateUserError(
              this.i18n.t<UserLocaleType>('incorrectCurrentPassword')
            )
          )
        }
      }

      if (email && email !== user.email) {
        const userWithSameEmail = await this.userRepository.findByEmail(email)

        if (userWithSameEmail) {
          return failure(
            new UserAlreadyExistsError(
              this.i18n.t<UserLocaleType>('userWithSameEmail', email)
            )
          )
        }
      }

      if (password) {
        data.password = await this.hasher.hash(password)
      }
    }

    const updatedUser = await this.userRepository.update(userId, data)

    return success(updatedUser)
  }
}
