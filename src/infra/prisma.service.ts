import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'production'
          ? ['warn', 'error']
          : ['warn', 'error', 'query', 'info'],
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}
