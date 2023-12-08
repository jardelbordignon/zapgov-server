import { CityHall } from '@prisma/client'

import { CreateCityHallData } from 'src/contracts/city-halls'

export abstract class CityHallRepository {
  abstract create(data: CreateCityHallData): Promise<void>
  abstract findByEmail(email: string): Promise<CityHall | null>
  abstract findById(id: string): Promise<CityHall | null>
  abstract findBySlug(slug: string): Promise<CityHall | null>
}
