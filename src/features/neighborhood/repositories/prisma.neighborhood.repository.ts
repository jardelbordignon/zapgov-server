import type { Neighborhood } from '@prisma/client'

import {
  CreateNeighborhoodData,
  UpdateNeighborhoodData,
} from 'src/contracts/neighborhoods'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import { NeighborhoodRepository } from './neighborhood.repository'

export class PrismaNeighborhoodRepository
  extends PrismaService
  implements NeighborhoodRepository
{
  async create(data: CreateNeighborhoodData): Promise<void> {
    await this.neighborhood.create({ data })
  }

  async delete(id: string): Promise<void> {
    await this.neighborhood.delete({ where: { id } })
  }

  async findByName(name: string): Promise<Neighborhood | null> {
    return this.neighborhood.findFirst({ where: { name } })
  }

  async findById(id: string): Promise<Neighborhood | null> {
    return this.neighborhood.findFirst({ where: { id } })
  }

  private async findNeighborhoods(
    page: number,
    perPage: number,
    deleted: boolean,
    searchTerm?: string
  ): Promise<PaginatedResponse<Neighborhood>> {
    const take = Number(perPage)
    const skip = (Number(page) - 1) * take

    const deletedCondition = deleted
      ? { NOT: { deleted_at: null } }
      : { deleted_at: null }

    const where = {
      ...deletedCondition,
      OR: searchTerm
        ? [{ name: { contains: searchTerm, mode: 'insensitive' } }]
        : undefined,
    } as any

    const [data, totalItems] = await this.$transaction([
      this.neighborhood.findMany({ skip, take, where }),
      this.neighborhood.count({ where }),
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
  }: PaginationParams): Promise<PaginatedResponse<Neighborhood>> {
    return this.findNeighborhoods(page, perPage, false, searchTerm)
  }

  async findAllDeleted({
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<Neighborhood>> {
    return this.findNeighborhoods(page, perPage, true, searchTerm)
  }

  async update(id: string, data: UpdateNeighborhoodData): Promise<Neighborhood> {
    console.log('-------------------------------- data\n', data)
    return this.neighborhood.update({ data, where: { id } })
  }
}
