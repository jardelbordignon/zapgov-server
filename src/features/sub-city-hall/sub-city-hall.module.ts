import { Module } from '@nestjs/common'

import { PrismaService } from 'src/infra/prisma.service'

import { PrismaSubCityHallRepository } from './repositories/prisma.sub-city-hall.repository'
import { SubCityHallRepository } from './repositories/sub-city-hall.repository'

@Module({
  controllers: [],
  exports: [PrismaService],
  providers: [
    PrismaService,
    {
      provide: SubCityHallRepository,
      useClass: PrismaSubCityHallRepository,
    },
  ],
})
export class SubCityHallModule {}
