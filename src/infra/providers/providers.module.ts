import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { CryptographyModule } from './cryptography/cryptography.module'
import { FileStorageModule } from './file-storage/file-storage.module'
import { I18nModule } from './i18n/i18n.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    AuthModule,
    CryptographyModule,
    PrismaModule,
    FileStorageModule,
    I18nModule,
  ],
})
export class ProvidersModule {}
