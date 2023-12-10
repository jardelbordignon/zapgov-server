import { SubCityHall } from '@prisma/client'

import {
  CreateSubCityHallData,
  UpdateSubCityHallData,
} from 'src/contracts/sub-city-halls'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

export abstract class SubCityHallRepository {
  abstract create(data: CreateSubCityHallData): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract findByEmail(email: string): Promise<SubCityHall | null>
  abstract findById(id: string): Promise<SubCityHall | null>
  abstract findAll(params: PaginationParams): Promise<PaginatedResponse<SubCityHall>>
  abstract findAllDeleted(
    params: PaginationParams
  ): Promise<PaginatedResponse<SubCityHall>>
  abstract update(id: string, data: UpdateSubCityHallData): Promise<SubCityHall>
}
