import { randomUUID } from 'node:crypto'

import type { CityHall } from '@prisma/client'

import type { CreateCityHallData } from 'src/contracts/city-halls'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

import { CityHallRepository } from './city-hall.repository'

export class InMemoryCityHallRepository implements CityHallRepository {
  cityHalls: CityHall[] = []

  async create(data: CreateCityHallData): Promise<void> {
    const date = new Date()

    const cityHall: CityHall = {
      ...data,
      created_at: date,
      deleted_at: null,
      id: randomUUID(),
      updated_at: date,
    }

    this.cityHalls.push(cityHall)
  }

  async findByEmail(email: string): Promise<CityHall | null> {
    const cityHall = this.cityHalls.find(cityHall => cityHall.email === email)
    if (!cityHall) return null
    return cityHall
  }

  async findById(id: string): Promise<CityHall | null> {
    const cityHall = this.cityHalls.find(cityHall => cityHall.id === id)
    if (!cityHall) return null
    return cityHall
  }

  async findBySlug(slug: string): Promise<CityHall | null> {
    const cityHall = this.cityHalls.find(cityHall => cityHall.slug === slug)
    if (!cityHall) return null
    return cityHall
  }

  private async findCityHalls(
    page: number,
    perPage: number,
    deleted: boolean
  ): Promise<PaginatedResponse<CityHall>> {
    const start = (page - 1) * perPage
    const end = start + perPage

    const users = deleted
      ? this.cityHalls.filter(user => user.deleted_at)
      : this.cityHalls.filter(user => !user.deleted_at)

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
  }: PaginationParams): Promise<PaginatedResponse<CityHall>> {
    return this.findCityHalls(page, perPage, false)
  }

  async findAllDeleted({
    page,
    perPage,
  }: PaginationParams): Promise<PaginatedResponse<CityHall>> {
    return this.findCityHalls(page, perPage, true)
  }
}
