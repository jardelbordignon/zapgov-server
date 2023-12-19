import { randomUUID } from 'node:crypto'

import type { Neighborhood } from '@prisma/client'

import type {
  CreateNeighborhoodData,
  UpdateNeighborhoodData,
} from 'src/contracts/neighborhoods'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

import { NeighborhoodRepository } from './neighborhood.repository'

export class InMemoryNeighborhoodRepository implements NeighborhoodRepository {
  items: Neighborhood[] = []

  async create(data: CreateNeighborhoodData): Promise<void> {
    const date = new Date()

    const item: Neighborhood = {
      ...data,
      created_at: date,
      deleted_at: null,
      id: randomUUID(),
      updated_at: date,
    }

    this.items.push(item)
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

  private async findNeighborhoods(
    page: number,
    perPage: number,
    deleted: boolean,
    searchTerm?: string
  ): Promise<PaginatedResponse<Neighborhood>> {
    const start = (page - 1) * perPage
    const end = start + perPage

    let items = this.items.filter(({ deleted_at }) =>
      deleted ? deleted_at : !deleted_at
    )

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      items = items.filter(({ name }) => name.toLowerCase().includes(term))
    }

    const data = items.slice(start, end)
    const totalItems = items.length
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
  }: PaginationParams): Promise<PaginatedResponse<Neighborhood>> {
    return this.findNeighborhoods(page, perPage, false, searchTerm)
  }

  async findAllDeleted({
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<Neighborhood>> {
    return this.findNeighborhoods(page, perPage, true, searchTerm)
  }

  async update(id: string, data: UpdateNeighborhoodData): Promise<Neighborhood> {
    const index = this.items.findIndex(item => item.id === id)
    this.items[index] = Object.assign(this.items[index], data)
    return this.items[index]
  }
}
