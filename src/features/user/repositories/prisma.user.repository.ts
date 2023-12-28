import type { User } from '@prisma/client'

import { CreateUserData, UpdateUserData } from 'src/contracts/account'
import {
  PaginatedResponse,
  PaginationParams,
  paginator,
} from 'src/infra/providers/pagination'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import { UserRepository } from './user.repository'

export class PrismaUserRepository extends PrismaService implements UserRepository {
  async create(data: CreateUserData): Promise<void> {
    const { email, name, password, roles } = data
    await this.user.create({ data: { email, name, password, roles } })
  }

  async delete(id: string): Promise<void> {
    await this.user.delete({ where: { id } })
  }

  async findAll({
    deleted,
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<User>> {
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

    return paginator(this.user, { page, perPage, where })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.user.findUnique({ where: { email } })
  }

  async findById(id: string): Promise<User | null> {
    return this.user.findFirst({ where: { id } })
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const { deleted_at, email, name, password, roles } = data
    return this.user.update({
      data: { deleted_at, email, name, password, roles },
      where: { id },
    })
  }
}
