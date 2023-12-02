import type { User } from '@prisma/client'

import { CreateUserData, UpdateUserData } from 'src/contracts/account'
import { PrismaService } from 'src/infra/prisma.service'

import { UserRepository } from './user.repository'

export class PrismaUserRepository extends PrismaService implements UserRepository {
  async create(data: CreateUserData): Promise<void> {
    await this.user.create({ data })
  }

  async delete(id: string): Promise<void> {
    await this.user.delete({ where: { id } })
  }

  async findAll(): Promise<User[]> {
    return this.user.findMany()
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
