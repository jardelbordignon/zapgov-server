import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'

import { I18n } from 'src/infra/providers/i18n/i18n'
import {
  FailureOrSuccess,
  failure,
  success,
} from 'src/infra/utils/failure-or-success-service-execute'

import { UserRepository } from '../../repositories/user.repository'
import type { UserLocaleType } from '../../shared/locales/type'
import { UserNotFoundError } from '../errors'

type ShowUserServiceResponse = FailureOrSuccess<UserNotFoundError, User>

@Injectable()
export class ShowUserService {
  constructor(
    private userRepository: UserRepository,
    private i18n: I18n
  ) {}

  async execute(id: string): Promise<ShowUserServiceResponse> {
    const user = await this.userRepository.findById(id)

    if (!user) {
      return failure(
        new UserNotFoundError(this.i18n.t<UserLocaleType>('userNotFound'))
      )
    }

    return success(user)
  }
}
