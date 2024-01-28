import {
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

import type { UserPayload } from './jwt.strategy'

@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const allowUnauthenticated = this.reflector.getAllAndOverride<boolean>(
      'allowUnauthenticated',
      [context.getHandler(), context.getClass()]
    )

    if (allowUnauthenticated) return true

    return super.canActivate(context)
  }

  handleRequest(err: any, user: UserPayload, info: any, context: any, status: any) {
    if (info && info.message === 'jwt expired') {
      throw new UnauthorizedException('AccessToken expired')
    }

    return super.handleRequest(err, user, info, context, status)
  }
}

export const AllowUnauthenticated = () => SetMetadata('allowUnauthenticated', true)
