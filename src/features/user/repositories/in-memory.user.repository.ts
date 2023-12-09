import { randomUUID } from 'node:crypto'

import type { User } from '@prisma/client'

import type { CreateUserData, UpdateUserData } from 'src/contracts/account'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

import { UserRepository } from './user.repository'

export class InMemoryUserRepository implements UserRepository {
  users: User[] = []

  async create(data: CreateUserData): Promise<void> {
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
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter(user => user.id !== id)
  }

  // async findAll({ page: 1, perPage: 100 }): Promise<User[]> {
  //   return this.users.filter(user => user.deleted_at === null)
  // }

  private async findUsers(
    page: number,
    perPage: number,
    deleted: boolean,
    searchTerm: string
  ): Promise<PaginatedResponse<User>> {
    const start = (page - 1) * perPage
    const end = start + perPage

    let users = this.users.filter(({ deleted_at }) =>
      deleted ? deleted_at : !deleted_at
    )

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      users = users.filter(
        ({ email, name }) =>
          email.toLowerCase().includes(term) || name.toLowerCase().includes(term)
      )
    }

    const data = users.slice(start, end)
    const totalItems = users.length
    const totalPages = Math.ceil(totalItems / perPage)
    const hasPrevious = start > 0
    const hasNext = end < totalItems

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
