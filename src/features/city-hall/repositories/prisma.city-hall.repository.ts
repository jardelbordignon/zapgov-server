import type { CityHall } from '@prisma/client'

import { CreateCityHallData, UpdateCityHallData } from 'src/contracts/city-halls'
import { PrismaService } from 'src/infra/prisma.service'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

import {
  CityHallInclude,
  CityHallRepository,
  ShowCityHallResponse,
} from './city-hall.repository'

export class PrismaCityHallRepository
  extends PrismaService
  implements CityHallRepository
{
  async create(data: CreateCityHallData): Promise<void> {
    await this.cityHall.create({ data })
  }

  async delete(id: string): Promise<void> {
    await this.cityHall.delete({ where: { id } })
  }

  async findByEmail(
    email: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    return this.cityHall.findUnique({ include, where: { email } })
  }

  async findById(
    id: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    return this.cityHall.findFirst({ include, where: { id } })
  }

  async findBySlug(
    slug: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    return this.cityHall.findUnique({ include, where: { slug } })
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
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { slug: { contains: searchTerm, mode: 'insensitive' } },
          ]
        : undefined,
    } as any

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

  async update(id: string, data: UpdateCityHallData): Promise<CityHall> {
    return this.cityHall.update({ data, where: { id } })
  }
}
