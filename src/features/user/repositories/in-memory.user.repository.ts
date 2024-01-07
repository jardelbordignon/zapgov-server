import { randomUUID } from 'node:crypto'

import type { User } from '@prisma/client'

import type { CreateUserData, UpdateUserData } from 'src/contracts/account'
import {
  PaginatedResponse,
  PaginationParams,
  inMemoryPaginator,
} from 'src/infra/providers/pagination'

import { UserRepository } from './user.repository'

export class InMemoryUserRepository implements UserRepository {
  users: User[] = []

  async create(data: CreateUserData): Promise<User> {
    const date = new Date()

    const user: User = {
      ...data,
      created_at: date,
      deleted_at: null,
      id: randomUUID(),
      roles: data.roles || [],
      updated_at: date,
    }

    this.users.push(user)

    return user
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter(user => user.id !== id)
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return inMemoryPaginator(this.users, params)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(user => user.email === email)
    if (!user) return null
    return user
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(user => user.id === id)
    if (!user) return null
    return user
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const index = this.users.findIndex(user => user.id === id)
    this.users[index] = Object.assign(this.users[index], data)
    return this.users[index]
  }
}
