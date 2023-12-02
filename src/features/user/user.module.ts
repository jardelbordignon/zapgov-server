import { Module } from '@nestjs/common'

import { PrismaService } from 'src/infra/prisma.service'

import { PrismaUserRepository } from './repositories/prisma.user.repository'
import { UserRepository } from './repositories/user.repository'
import { AuthUserController } from './use-cases/auth-user/auth-user.controller'
import { AuthUserService } from './use-cases/auth-user/auth-user.service'
import { CreateUserController } from './use-cases/create-user/create-user.controller'
import { CreateUserService } from './use-cases/create-user/create-user.service'

@Module({
  controllers: [AuthUserController, CreateUserController],
  exports: [PrismaService],
  providers: [
    PrismaService,
    AuthUserService,
    CreateUserService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
})
export class UserModule {}
