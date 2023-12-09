import { randomUUID } from 'node:crypto'

import type { CityHall } from '@prisma/client'

import type { CreateCityHallData, UpdateCityHallData } from 'src/contracts/city-halls'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

import { CityHallRepository } from './city-hall.repository'

export class InMemoryCityHallRepository implements CityHallRepository {
  items: CityHall[] = []

  async create(data: CreateCityHallData): Promise<void> {
    const date = new Date()

    const cityHall: CityHall = {
      ...data,
      created_at: date,
      deleted_at: null,
      id: randomUUID(),
      updated_at: date,
    }

    this.items.push(cityHall)
  }

  async findByEmail(email: string): Promise<CityHall | null> {
    const cityHall = this.items.find(cityHall => cityHall.email === email)
    if (!cityHall) return null
    return cityHall
  }

  async findById(id: string): Promise<CityHall | null> {
    const cityHall = this.items.find(cityHall => cityHall.id === id)
    if (!cityHall) return null
    return cityHall
  }

  async findBySlug(slug: string): Promise<CityHall | null> {
    const cityHall = this.items.find(cityHall => cityHall.slug === slug)
    if (!cityHall) return null
    return cityHall
  }

  private async findCityHalls(
    page: number,
    perPage: number,
    deleted: boolean,
    searchTerm: string
  ): Promise<PaginatedResponse<CityHall>> {
    const start = (page - 1) * perPage
    const end = start + perPage

    let items = this.items.filter(({ deleted_at }) =>
      deleted ? deleted_at : !deleted_at
    )

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      items = items.filter(
        ({ email, name, slug }) =>
          email.toLowerCase().includes(term) ||
          name.toLowerCase().includes(term) ||
          slug.toLowerCase().includes(term)
      )
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
  }: PaginationParams): Promise<PaginatedResponse<CityHall>> {
    return this.findCityHalls(page, perPage, false, searchTerm)
  }

  async findAllDeleted({
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<CityHall>> {
    return this.findCityHalls(page, perPage, true, searchTerm)
  }

  async update(id: string, data: UpdateCityHallData): Promise<CityHall> {
    const index = this.items.findIndex(item => item.id === id)
    this.items[index] = Object.assign(this.items[index], data)
    return this.items[index]
  }
}
