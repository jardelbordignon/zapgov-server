import { randomUUID } from 'node:crypto'

import type { Neighborhood } from '@prisma/client'

import type {
  CreateNeighborhoodData,
  UpdateNeighborhoodData,
} from 'src/contracts/neighborhoods'
import {
  PaginatedResponse,
  PaginationParams,
  inMemoryPaginator,
} from 'src/infra/providers/pagination'

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

  async findAll({
    deleted,
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<Neighborhood>> {
    let items = this.items.filter(({ deleted_at }) =>
      deleted ? deleted_at : !deleted_at
    )

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      items = items.filter(({ name }) => name.toLowerCase().includes(term))
    }

    return inMemoryPaginator(items, page, perPage)
  }

  async update(id: string, data: UpdateNeighborhoodData): Promise<Neighborhood> {
    const index = this.items.findIndex(item => item.id === id)
    this.items[index] = Object.assign(this.items[index], data)
    return this.items[index]
  }
}
