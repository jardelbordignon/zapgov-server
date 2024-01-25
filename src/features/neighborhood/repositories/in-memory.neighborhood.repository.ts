import { randomUUID } from 'node:crypto'

import type { Neighborhood } from '@prisma/client'

import type {
  CreateNeighborhoodData,
  UpdateNeighborhoodData,
} from 'src/contracts/neighborhoods'
import { ListParams, ListResponse, inMemoryList } from 'src/infra/providers/list'

import { NeighborhoodRepository } from './neighborhood.repository'

export class InMemoryNeighborhoodRepository implements NeighborhoodRepository {
  items: Neighborhood[] = []

  async create(data: CreateNeighborhoodData): Promise<Neighborhood> {
    const date = new Date()

    const item: Neighborhood = {
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

  async findByName(name: string): Promise<Neighborhood | null> {
    const item = this.items.find(item => item.name === name)
    if (!item) return null
    return item
  }

  async findById(id: string): Promise<Neighborhood | null> {
    const item = this.items.find(item => item.id === id)
    if (!item) return null
    return item
  }

  async findAll(params?: ListParams): Promise<ListResponse<Neighborhood>> {
    return inMemoryList(this.items, params)
  }

  async update(id: string, data: UpdateNeighborhoodData): Promise<Neighborhood> {
    const index = this.items.findIndex(item => item.id === id)
    this.items[index] = Object.assign(this.items[index], data)
    return this.items[index]
  }
}
