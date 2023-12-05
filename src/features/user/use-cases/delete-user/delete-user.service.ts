import { Injectable } from '@nestjs/common'

import { UserPayload } from 'src/infra/auth/jwt-strategy'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
import { UnauthorizedToDeleteAnAdminUserError, UserNotFoundError } from '../errors'

type DeleteUserServiceResponse = FailureOrSuccess<
  UnauthorizedToDeleteAnAdminUserError | UserNotFoundError,
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
    if (userId === loggedUser.sub && loggedUser.roles?.includes('ADMIN')) {
      return failure(new UnauthorizedToDeleteAnAdminUserError())
    }

    const user = await this.userRepository.findById(userId)

    if (!user) {
      return failure(new UserNotFoundError())
    }

    if (user.roles?.includes('ADMIN')) {
      return failure(new UnauthorizedToDeleteAnAdminUserError())
    }

    if (soft) {
      await this.userRepository.update(userId, { deleted_at: new Date() })
      return success(null)
    }

    return success(await this.userRepository.delete(userId))
  }
}
