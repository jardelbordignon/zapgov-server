import { randomUUID } from 'node:crypto'

import type { SubCityHall } from '@prisma/client'

import type {
  CreateSubCityHallData,
  UpdateSubCityHallData,
} from 'src/contracts/sub-city-halls'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

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

  async create(data: CreateSubCityHallData): Promise<void> {
    const date = new Date()

    const item: SubCityHall = {
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
    const start = (page - 1) * perPage
    const end = start + perPage

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
  }: PaginationParams): Promise<PaginatedResponse<SubCityHall>> {
    return this.findSubCityHalls({
      cityHallId: undefined,
      deleted: false,
      page,
      perPage,
      searchTerm,
    })
  }

  async findAllDeleted({
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<SubCityHall>> {
    return this.findSubCityHalls({
      cityHallId: undefined,
      deleted: true,
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

  async findAllDeletedByCityHallId(
    cityHallId: string,
    searchTerm: string
  ): Promise<SubCityHall[]> {
    const result = await this.findSubCityHalls({
      cityHallId,
      deleted: true,
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
