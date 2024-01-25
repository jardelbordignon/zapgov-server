import { SubCityHall } from '@prisma/client'

import {
  CreateSubCityHallData,
  UpdateSubCityHallData,
} from 'src/contracts/sub-city-halls'
import { ListParams, ListResponse } from 'src/infra/providers/list'

export abstract class SubCityHallRepository {
  abstract create(data: CreateSubCityHallData): Promise<SubCityHall>
  abstract delete(id: string): Promise<void>
  abstract findByEmail(email: string): Promise<SubCityHall | null>
  abstract findById(id: string): Promise<SubCityHall | null>
  abstract findAll(params?: ListParams): Promise<ListResponse<SubCityHall>>
  abstract update(id: string, data: UpdateSubCityHallData): Promise<SubCityHall>
}
