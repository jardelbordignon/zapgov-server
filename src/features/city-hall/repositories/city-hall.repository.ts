import { CityHall, Neighborhood, Prisma, SubCityHall } from '@prisma/client'

import { CreateCityHallData, UpdateCityHallData } from 'src/contracts/city-halls'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

export type CityHallInclude = Omit<Prisma.CityHallInclude, '_count'>

export type ShowCityHallResponse =
  | (CityHall & {
      subCityHalls?: SubCityHall[]
      neighborhoods?: Neighborhood[]
    })
  | null

export abstract class CityHallRepository {
  abstract create(data: CreateCityHallData): Promise<CityHall>
  abstract delete(id: string): Promise<void>
  abstract findByEmail(
    email: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse>
  abstract findById(
    id: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse>
  abstract findBySlug(
    slug: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse>
  abstract findAll(params: PaginationParams): Promise<PaginatedResponse<CityHall>>
  abstract update(id: string, data: UpdateCityHallData): Promise<CityHall>
}
