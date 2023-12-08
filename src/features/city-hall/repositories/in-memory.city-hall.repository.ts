import { randomUUID } from 'node:crypto'

import type { CityHall } from '@prisma/client'

import type { CreateCityHallData } from 'src/contracts/city-halls'

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
}
