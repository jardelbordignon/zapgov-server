import { Module } from '@nestjs/common'

import { Encrypter } from './encrypter/encrypter'
import { JwtEncrypter } from './encrypter/jwt-encrypter'
import { BcryptHasher } from './hasher/bcrypt-hasher'
import { Hasher } from './hasher/hasher'

@Module({
  exports: [Encrypter, Hasher],
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: Hasher, useClass: BcryptHasher },
  ],
})
export class CryptographyModule {}
