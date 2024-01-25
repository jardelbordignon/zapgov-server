import { Neighborhood } from '@prisma/client'

import {
  CreateNeighborhoodData,
  UpdateNeighborhoodData,
} from 'src/contracts/neighborhoods'
import { ListParams, ListResponse } from 'src/infra/providers/list'

export abstract class NeighborhoodRepository {
  abstract create(data: CreateNeighborhoodData): Promise<Neighborhood>
  abstract delete(id: string): Promise<void>
  abstract findByName(name: string): Promise<Neighborhood | null>
  abstract findById(id: string): Promise<Neighborhood | null>
  abstract findAll(params?: ListParams): Promise<ListResponse<Neighborhood>>
  abstract update(id: string, data: UpdateNeighborhoodData): Promise<Neighborhood>
}
