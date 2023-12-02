import { Module } from '@nestjs/common'

import { PrismaService } from 'src/infra/prisma.service'

import { PrismaUserRepository } from './repositories/prisma.user.repository'
import { UserRepository } from './repositories/user.repository'
import { CreateUserController } from './use-cases/create-user/create-user.controller'
import { CreateUserService } from './use-cases/create-user/create-user.service'

@Module({
  controllers: [CreateUserController],
  exports: [PrismaService],
  providers: [
    PrismaService,
    CreateUserService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
})
export class UserModule {}
