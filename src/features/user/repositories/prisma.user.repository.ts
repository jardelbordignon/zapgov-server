import type { User } from '@prisma/client'

import { CreateUserData, UpdateUserData } from 'src/contracts/account'
import {
  PaginatedResponse,
  PaginationParams,
  prismaPaginator,
} from 'src/infra/providers/pagination'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import { UserRepository } from './user.repository'

export class PrismaUserRepository extends PrismaService implements UserRepository {
  async create(data: CreateUserData): Promise<User> {
    const { email, name, password, roles } = data
    return this.user.create({ data: { email, name, password, roles } })
  }

  async delete(id: string): Promise<void> {
    await this.user.delete({ where: { id } })
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return prismaPaginator(this.user, params)
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
