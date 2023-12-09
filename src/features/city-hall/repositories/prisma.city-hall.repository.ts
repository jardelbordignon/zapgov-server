import type { CityHall } from '@prisma/client'

import { CreateCityHallData } from 'src/contracts/city-halls'
import { PrismaService } from 'src/infra/prisma.service'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

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

  private async findCityHalls(
    page: number,
    perPage: number,
    deleted: boolean,
    searchTerm: string
  ): Promise<PaginatedResponse<CityHall>> {
    const skip = (page - 1) * perPage

    const deletedCondition = deleted
      ? { NOT: { deleted_at: null } }
      : { deleted_at: null }

    const where = {
      ...deletedCondition,
      OR: searchTerm
        ? [
            { name: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { slug: { contains: searchTerm } },
          ]
        : undefined,
    }

    const [data, totalItems] = await this.$transaction([
      this.cityHall.findMany({ skip, take: perPage, where }),
      this.cityHall.count({ where }),
    ])

    const hasPrevious = skip > 0
    const hasNext = skip + perPage < totalItems
    const totalPages = Math.ceil(totalItems / perPage)

    return {
      data,
      meta: {
        hasNext,
        hasPrevious,
        page,
        perPage,
        totalItems,
        totalPages,
      },
    }
  }

  async findAll({
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<CityHall>> {
    return this.findCityHalls(page, perPage, false, searchTerm)
  }

  async findAllDeleted({
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<CityHall>> {
    return this.findCityHalls(page, perPage, true, searchTerm)
  }
}
