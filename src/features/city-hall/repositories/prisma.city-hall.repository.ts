import type { CityHall } from '@prisma/client'

import { CreateCityHallData } from 'src/contracts/city-halls'
import { PrismaService } from 'src/infra/prisma.service'

import { CityHallRepository } from './city-hall.repository'

export class PrismaCityHallRepository
  extends PrismaService
  implements CityHallRepository
{
  async create(data: CreateCityHallData): Promise<void> {
    await this.cityHall.create({ data })
  }

  async findByEmail(email: string): Promise<CityHall | null> {
    return this.cityHall.findUnique({ where: { email } })
  }

  async findById(id: string): Promise<CityHall | null> {
    return this.cityHall.findFirst({ where: { id } })
  }

  async findBySlug(slug: string): Promise<CityHall | null> {
    return this.cityHall.findUnique({ where: { slug } })
  }
}
