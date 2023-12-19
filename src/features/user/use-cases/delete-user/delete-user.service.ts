import { Injectable } from '@nestjs/common'

import { UserPayload } from 'src/infra/providers/auth/jwt-strategy'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
import {
  OnlyAdminsCanDeleteOtherAccount,
  UnauthorizedToDeleteAnAdminUserError,
  UserNotFoundError,
} from '../errors'

export type DeleteUserServiceResponse = FailureOrSuccess<
  | OnlyAdminsCanDeleteOtherAccount
  | UnauthorizedToDeleteAnAdminUserError
  | UserNotFoundError,
  void
>

@Injectable()
export class DeleteUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(
    loggedUser: UserPayload,
    userId: string,
    soft: boolean
  ): Promise<DeleteUserServiceResponse> {
    const isAdmin = loggedUser.roles?.includes('ADMIN')

    // admin trying to deleting own account
    if (userId === loggedUser.sub && isAdmin) {
      return failure(new UnauthorizedToDeleteAnAdminUserError())
    }

    const user = await this.userRepository.findById(userId)

    if (!user) {
      return failure(new UserNotFoundError())
    }

    // admin trying to deleting other admin account
    if (user.roles?.includes('ADMIN')) {
      return failure(new UnauthorizedToDeleteAnAdminUserError())
    }

    // common user trying to delete other account
    if (user.id !== loggedUser.sub && !isAdmin) {
      return failure(new OnlyAdminsCanDeleteOtherAccount())
    }

    if (soft) {
      await this.userRepository.update(userId, { deleted_at: new Date() })
      return success(undefined)
    }

    return success(await this.userRepository.delete(userId))
  }
}
