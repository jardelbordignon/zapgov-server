import { Neighborhood } from '@prisma/client'

import {
  CreateNeighborhoodData,
  UpdateNeighborhoodData,
} from 'src/contracts/neighborhoods'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

export abstract class NeighborhoodRepository {
  abstract create(data: CreateNeighborhoodData): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract findByName(name: string): Promise<Neighborhood | null>
  abstract findById(id: string): Promise<Neighborhood | null>
  abstract findAll(params: PaginationParams): Promise<PaginatedResponse<Neighborhood>>
  abstract findAllDeleted(
    params: PaginationParams
  ): Promise<PaginatedResponse<Neighborhood>>
  abstract update(id: string, data: UpdateNeighborhoodData): Promise<Neighborhood>
}
