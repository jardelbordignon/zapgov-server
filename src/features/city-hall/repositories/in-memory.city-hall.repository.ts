import { randomUUID } from 'node:crypto'

import type { CityHall, Neighborhood, SubCityHall } from '@prisma/client'

import type { CreateCityHallData, UpdateCityHallData } from 'src/contracts/city-halls'
import {
  PaginatedResponse,
  PaginationParams,
  inMemoryPaginator,
} from 'src/infra/providers/pagination'

import {
  CityHallInclude,
  CityHallRepository,
  ShowCityHallResponse,
} from './city-hall.repository'

export class InMemoryCityHallRepository implements CityHallRepository {
  cityHalls: CityHall[] = []
  subCityHalls: SubCityHall[] = []
  neighborhoods: Neighborhood[] = []

  async create(data: CreateCityHallData): Promise<CityHall> {
    const date = new Date()

    const cityHall: CityHall = {
      ...data,
      created_at: date,
      deleted_at: null,
      id: randomUUID(),
      updated_at: date,
    }

    this.cityHalls.push(cityHall)

    return cityHall
  }

  async delete(id: string): Promise<void> {
    this.cityHalls = this.cityHalls.filter(item => item.id !== id)
  }

  private async handleShowCityHall(
    cityHall: CityHall,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    let result = cityHall

    if (include?.neighborhoods) {
      const neighborhoods = this.neighborhoods.filter(
        item => item.city_hall_id === cityHall.id
      )
      result = Object.assign(result, { neighborhoods })
    }

    if (include?.sub_city_halls) {
      const subCityHalls = this.subCityHalls.filter(
        item => item.city_hall_id === cityHall.id
      )
      result = Object.assign(result, { subCityHalls })
    }

    return result
  }

  async findByEmail(
    email: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    const cityHall = this.cityHalls.find(cityHall => cityHall.email === email)
    if (!cityHall) return null
    return this.handleShowCityHall(cityHall, include)
  }

  async findById(
    id: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    const cityHall = this.cityHalls.find(cityHall => cityHall.id === id)
    if (!cityHall) return null
    return this.handleShowCityHall(cityHall, include)
  }

  async findBySlug(
    slug: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    const cityHall = this.cityHalls.find(cityHall => cityHall.slug === slug)
    if (!cityHall) return null
    return this.handleShowCityHall(cityHall, include)
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResponse<CityHall>> {
    return inMemoryPaginator(this.cityHalls, params)
  }

  async update(id: string, data: UpdateCityHallData): Promise<CityHall> {
    const index = this.cityHalls.findIndex(item => item.id === id)
    this.cityHalls[index] = Object.assign(this.cityHalls[index], data)
    return this.cityHalls[index]
  }
}
