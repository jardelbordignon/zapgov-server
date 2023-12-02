import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { envSchema } from './env'
import { EnvService } from './env.service'

@Module({
  exports: [EnvService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate: env => envSchema.parse(env),
    }),
  ],
  providers: [EnvService],
})
export class EnvModule {}
