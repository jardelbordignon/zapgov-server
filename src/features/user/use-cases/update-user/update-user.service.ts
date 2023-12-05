import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'

import type { UpdateUserData } from 'src/contracts/account'
import { Hasher } from 'src/infra/cryptography/hasher/hasher'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
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
    private hasher: Hasher
  ) {}

  async execute(
    userId: string,
    data: UpdateUserData
  ): Promise<UpdateUserServiceResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return failure(new UserNotFoundError())
    }

    const { currentPassword, email, password } = data

    if (email || password) {
      if (!currentPassword) {
        return failure(
          new UnauthorizedToUpdateUserError(
            'Property currentPassword is required to change email or password.'
          )
        )
      }

      const matchPassword = await this.hasher.compare(currentPassword, user.password)

      if (!matchPassword) {
        return failure(
          new UnauthorizedToUpdateUserError('Incorrect current password')
        )
      }

      if (email) {
        const userWithSameEmail = await this.userRepository.findByEmail(email)

        if (userWithSameEmail) {
          return failure(
            new UserAlreadyExistsError(
              `User with ${email} email address already exists.`
            )
          )
        }
      }

      if (password) {
        data.password = await this.hasher.hash(password)
      }
    }

    delete data.currentPassword

    const updatedUser = await this.userRepository.update(userId, data)

    return success(updatedUser)
  }
}
