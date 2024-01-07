import { randomUUID } from 'node:crypto'

import type { Contact } from '@prisma/client'

import type { CreateContactData } from 'src/contracts/contacts'
import {
  PaginatedResponse,
  PaginationParams,
  inMemoryPaginator,
} from 'src/infra/providers/pagination'

import { ContactRepository } from './contact.repository'

export class InMemoryContactRepository implements ContactRepository {
  items: Contact[] = []

  async create(data: CreateContactData): Promise<Contact> {
    const date = new Date()

    const item: Contact = {
      ...data,
      created_at: date,
      deleted_at: null,
      id: randomUUID(),
      updated_at: date,
    }

    this.items.push(item)
    return item
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter(item => item.id !== id)
  }

  async findByPhone(phone: string): Promise<Contact | null> {
    const item = this.items.find(item => item.phone === phone)
    if (!item) return null
    return item
  }

  async findById(id: string): Promise<Contact | null> {
    const item = this.items.find(item => item.id === id)
    if (!item) return null
    return item
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResponse<Contact>> {
    return inMemoryPaginator(this.items, params)
  }

  // async update(id: string, data: UpdateContactData): Promise<Contact> {
  //   const index = this.items.findIndex(item => item.id === id)
  //   this.items[index] = Object.assign(this.items[index], data)
  //   return this.items[index]
  // }
}
