import type { User } from '@prisma/client'

import { CreateUserData, UpdateUserData } from 'src/contracts/account'
import { PrismaService } from 'src/infra/prisma.service'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

import { UserRepository } from './user.repository'

export class PrismaUserRepository extends PrismaService implements UserRepository {
  async create(data: CreateUserData): Promise<void> {
    await this.user.create({ data })
  }

  async delete(id: string): Promise<void> {
    await this.user.delete({ where: { id } })
  }

  // async findAll(): Promise<User[]> {
  //   return this.user.findMany({ where: { deleted_at: null } })
  // }

  // async findAllDeleted(): Promise<User[]> {
  //   return this.user.findMany({ where: { NOT: { deleted_at: null } } })
  // }

  private async findUsers(
    page: number,
    perPage: number,
    deleted: boolean,
    searchTerm: string
  ): Promise<PaginatedResponse<User>> {
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
      this.user.findMany({ skip, take: perPage, where }),
      this.user.count({ where }),
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
  }: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.findUsers(page, perPage, false, searchTerm)
  }

  async findAllDeleted({
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.findUsers(page, perPage, true, searchTerm)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.user.findUnique({ where: { email } })
  }

  async findById(id: string): Promise<User | null> {
    return this.user.findFirst({ where: { id } })
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.user.update({ data, where: { id } })
  }
}
