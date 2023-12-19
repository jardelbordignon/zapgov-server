import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { CryptographyModule } from './cryptography/cryptography.module'
import { PrismaModule } from './prisma/prisma.module'
import { StorageModule } from './storage/storage.module'

@Module({
  imports: [AuthModule, CryptographyModule, PrismaModule, StorageModule],
})
export class ProvidersModule {}
