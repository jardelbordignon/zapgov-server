import { randomUUID } from 'node:crypto'

import type { SubCityHall } from '@prisma/client'

import type {
  CreateSubCityHallData,
  UpdateSubCityHallData,
} from 'src/contracts/sub-city-halls'
import {
  PaginatedResponse,
  PaginationParams,
  inMemoryPaginator,
} from 'src/infra/providers/pagination'

import { SubCityHallRepository } from './sub-city-hall.repository'

type Props = {
  cityHallId?: string
  deleted: boolean
  page: number
  perPage: number
  searchTerm?: string
}

export class InMemorySubCityHallRepository implements SubCityHallRepository {
  items: SubCityHall[] = []

  async create(data: CreateSubCityHallData): Promise<SubCityHall> {
    const date = new Date()

    const item: SubCityHall = {
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

  async findByEmail(email: string): Promise<SubCityHall | null> {
    const item = this.items.find(item => item.email === email)
    if (!item) return null
    return item
  }

  async findById(id: string): Promise<SubCityHall | null> {
    const item = this.items.find(item => item.id === id)
    if (!item) return null
    return item
  }

  private async findSubCityHalls({
    cityHallId,
    deleted,
    page,
    perPage,
    searchTerm,
  }: Props): Promise<PaginatedResponse<SubCityHall>> {
    let items = this.items.filter(({ deleted_at }) =>
      deleted ? deleted_at : !deleted_at
    )

    if (cityHallId) {
      items = items.filter(({ city_hall_id }) => city_hall_id === cityHallId)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      items = items.filter(
        ({ email, name }) =>
          email?.toLowerCase().includes(term) || name.toLowerCase().includes(term)
      )
    }

    return inMemoryPaginator(items, page, perPage)
  }

  async findAll({
    deleted = false,
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<SubCityHall>> {
    return this.findSubCityHalls({
      cityHallId: undefined,
      deleted,
      page,
      perPage,
      searchTerm,
    })
  }

  async findAllByCityHallId(
    cityHallId: string,
    searchTerm: string
  ): Promise<SubCityHall[]> {
    const result = await this.findSubCityHalls({
      cityHallId,
      deleted: false,
      page: 1,
      perPage: 1000,
      searchTerm,
    })
    return result.data
  }

  async update(id: string, data: UpdateSubCityHallData): Promise<SubCityHall> {
    const index = this.items.findIndex(item => item.id === id)
    this.items[index] = Object.assign(this.items[index], data)
    return this.items[index]
  }
}
