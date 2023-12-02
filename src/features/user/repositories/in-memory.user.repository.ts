import { randomUUID } from 'node:crypto'

import type { User } from '@prisma/client'

import type { CreateUserData, UpdateUserData } from 'src/contracts/account'

import { UserRepository } from './user.repository'

export class InMemoryUserRepository implements UserRepository {
  users: User[] = []

  async create(data: CreateUserData): Promise<void> {
    const date = new Date()

    const user: User = {
      ...data,
      created_at: date,
      id: randomUUID(),
      permissions: [],
      roles: [],
      updated_at: date,
    }

    this.users.push(user)
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter(user => user.id !== id)
  }

  async findAll(): Promise<User[]> {
    return this.users
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
