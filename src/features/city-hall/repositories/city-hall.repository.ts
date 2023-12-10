import { CityHall } from '@prisma/client'

import { CreateCityHallData, UpdateCityHallData } from 'src/contracts/city-halls'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

export abstract class CityHallRepository {
  abstract create(data: CreateCityHallData): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract findByEmail(email: string): Promise<CityHall | null>
  abstract findById(id: string): Promise<CityHall | null>
  abstract findBySlug(slug: string): Promise<CityHall | null>
  abstract findAll(params: PaginationParams): Promise<PaginatedResponse<CityHall>>
  abstract findAllDeleted(
    params: PaginationParams
  ): Promise<PaginatedResponse<CityHall>>
  abstract update(id: string, data: UpdateCityHallData): Promise<CityHall>
}
