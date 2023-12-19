import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { EnvModule } from '../../env/env.module'
import { EnvService } from '../../env/env.service'

import { AuthenticationGuard } from './authentication.guard'
import { JwtStrategy } from './jwt-strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [EnvModule],
      inject: [EnvService],
      useFactory(envService: EnvService) {
        const expiresIn = envService.get('JWT_ACCESS_EXPIRES_IN')
        const privateKey = envService.get('JWT_PRIVATE_KEY')
        const publicKey = envService.get('JWT_PUBLIC_KEY')

        return {
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
          signOptions: { algorithm: 'RS256', expiresIn },
        }
      },
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
})
export class AuthModule {}
