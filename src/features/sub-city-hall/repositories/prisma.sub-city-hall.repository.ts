import type { SubCityHall } from '@prisma/client'

import {
  CreateSubCityHallData,
  UpdateSubCityHallData,
} from 'src/contracts/sub-city-halls'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import { SubCityHallRepository } from './sub-city-hall.repository'

type Props = {
  cityHallId?: string
  deleted: boolean
  page: number
  perPage: number
  searchTerm?: string
}

export class PrismaSubCityHallRepository
  extends PrismaService
  implements SubCityHallRepository
{
  async create(data: CreateSubCityHallData): Promise<void> {
    await this.subCityHall.create({ data })
  }

  async delete(id: string): Promise<void> {
    await this.subCityHall.delete({ where: { id } })
  }

  async findByEmail(email: string): Promise<SubCityHall | null> {
    return this.subCityHall.findUnique({ where: { email } })
  }

  async findById(id: string): Promise<SubCityHall | null> {
    return this.subCityHall.findFirst({ where: { id } })
  }

  private async findSubCityHalls({
    cityHallId,
    deleted,
    page,
    perPage,
    searchTerm,
  }: Props): Promise<PaginatedResponse<SubCityHall>> {
    const take = Number(perPage)
    const skip = (Number(page) - 1) * take

    const conditions = deleted ? { NOT: { deleted_at: null } } : { deleted_at: null }

    if (cityHallId) {
      Object.assign(conditions, { city_hall_id: cityHallId })
    }

    const where = {
      ...conditions,
      OR: searchTerm
        ? [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ]
        : undefined,
    } as any

    const [data, totalItems] = await this.$transaction([
      this.subCityHall.findMany({ skip, take, where }),
      this.subCityHall.count({ where }),
    ])

    const hasPrevious = skip > 0
    const hasNext = skip + take < totalItems
    const totalPages = Math.ceil(totalItems / take)

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
  }: PaginationParams): Promise<PaginatedResponse<SubCityHall>> {
    return this.findSubCityHalls({
      cityHallId: undefined,
      deleted: false,
      page,
      perPage,
      searchTerm,
    })
  }

  async findAllDeleted({
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<SubCityHall>> {
    return this.findSubCityHalls({
      cityHallId: undefined,
      deleted: true,
      page,
      perPage,
      searchTerm,
    })
  }

  async findAllByCityHallId(
    cityHallId: string,
    searchTerm: string
  ): Promise<SubCityHall[]> {
    const result = await this.findSubCityHalls({
      cityHallId,
      deleted: false,
      page: 1,
      perPage: 1000,
      searchTerm,
    })
    return result.data
  }

  async findAllDeletedByCityHallId(
    cityHallId: string,
    searchTerm: string
  ): Promise<SubCityHall[]> {
    const result = await this.findSubCityHalls({
      cityHallId,
      deleted: true,
      page: 1,
      perPage: 1000,
      searchTerm,
    })
    return result.data
  }

  async update(id: string, data: UpdateSubCityHallData): Promise<SubCityHall> {
    return this.subCityHall.update({ data, where: { id } })
  }
}
