import { Module } from '@nestjs/common'

import { CryptographyModule } from 'src/infra/cryptography/cryptography.module'
import { PrismaService } from 'src/infra/prisma.service'

import { PrismaUserRepository } from './repositories/prisma.user.repository'
import { UserRepository } from './repositories/user.repository'
import { AuthUserController } from './use-cases/auth-user/auth-user.controller'
import { AuthUserService } from './use-cases/auth-user/auth-user.service'
import { CreateUserController } from './use-cases/create-user/create-user.controller'
import { CreateUserService } from './use-cases/create-user/create-user.service'
import { ListUsersController } from './use-cases/list-users/list-users.controller'
import { ListUsersService } from './use-cases/list-users/list-users.service'
import { ShowUserController } from './use-cases/show-user/show-user.controller'
import { ShowUserService } from './use-cases/show-user/show-user.service'
import { UpdateUserController } from './use-cases/update-user/update-user.controller'
import { UpdateUserService } from './use-cases/update-user/update-user.service'

@Module({
  controllers: [
    AuthUserController,
    CreateUserController,
    ListUsersController,
    ShowUserController,
    UpdateUserController,
  ],
  exports: [PrismaService],
  imports: [CryptographyModule],
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    AuthUserService,
    CreateUserService,
    ListUsersService,
    ShowUserService,
    UpdateUserService,
  ],
})
export class UserModule {}
