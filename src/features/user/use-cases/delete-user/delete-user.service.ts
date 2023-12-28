import { Injectable } from '@nestjs/common'

import { UserPayload } from 'src/infra/providers/auth/jwt-strategy'
import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
import type { UserLocaleType } from '../../shared/locales/type'
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
  constructor(
    private userRepository: UserRepository,
    private i18n: I18n
  ) {}

  async execute(
    loggedUser: UserPayload,
    userId: string,
    soft: boolean
  ): Promise<DeleteUserServiceResponse> {
    const isAdmin = loggedUser.roles?.includes('ADMIN')

    // admin trying to deleting own account
    if (userId === loggedUser.sub && isAdmin) {
      return failure(
        new UnauthorizedToDeleteAnAdminUserError(
          this.i18n.t<UserLocaleType>('unauthorizedToDeleteAnAdminUser')
        )
      )
    }

    const user = await this.userRepository.findById(userId)

    if (!user) {
      return failure(new UserNotFoundError(this.i18n.t('userNotFound')))
    }

    // admin trying to deleting other admin account
    if (user.roles?.includes('ADMIN')) {
      return failure(
        new UnauthorizedToDeleteAnAdminUserError(
          this.i18n.t('unauthorizedToDeleteAnAdminUser')
        )
      )
    }

    // common user trying to delete other account
    if (user.id !== loggedUser.sub && !isAdmin) {
      return failure(
        new OnlyAdminsCanDeleteOtherAccount(
          this.i18n.t('onlyAdminsCanDeleteOtherAccount')
        )
      )
    }

    if (soft) {
      await this.userRepository.update(userId, { deleted_at: new Date() })
      return success(undefined)
    }

    return success(await this.userRepository.delete(userId))
  }
}
