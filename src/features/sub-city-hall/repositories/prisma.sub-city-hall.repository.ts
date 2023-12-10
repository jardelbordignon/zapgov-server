import type { SubCityHall } from '@prisma/client'

import {
  CreateSubCityHallData,
  UpdateSubCityHallData,
} from 'src/contracts/sub-city-halls'
import { PrismaService } from 'src/infra/prisma.service'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

import { SubCityHallRepository } from './sub-city-hall.repository'

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

  private async findSubCityHalls(
    page: number,
    perPage: number,
    deleted: boolean,
    searchTerm: string
  ): Promise<PaginatedResponse<SubCityHall>> {
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
          ]
        : undefined,
    } as any

    const [data, totalItems] = await this.$transaction([
      this.subCityHall.findMany({ skip, take: perPage, where }),
      this.subCityHall.count({ where }),
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
  }: PaginationParams): Promise<PaginatedResponse<SubCityHall>> {
    return this.findSubCityHalls(page, perPage, false, searchTerm)
  }

  async findAllDeleted({
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<SubCityHall>> {
    return this.findSubCityHalls(page, perPage, true, searchTerm)
  }

  async update(id: string, data: UpdateSubCityHallData): Promise<SubCityHall> {
    return this.subCityHall.update({ data, where: { id } })
  }
}
