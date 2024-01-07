import type { SubCityHall } from '@prisma/client'

import {
  CreateSubCityHallData,
  UpdateSubCityHallData,
} from 'src/contracts/sub-city-halls'
import {
  PaginatedResponse,
  PaginationParams,
  prismaPaginator,
} from 'src/infra/providers/pagination'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import { SubCityHallRepository } from './sub-city-hall.repository'

// type Props = {
//   cityHallId?: string
//   deleted: boolean
//   page: number
//   perPage: number
//   searchTerm?: string
// }

export class PrismaSubCityHallRepository
  extends PrismaService
  implements SubCityHallRepository
{
  async create(data: CreateSubCityHallData): Promise<SubCityHall> {
    const { city_hall_id, email, name, observation, phone } = data
    return this.subCityHall.create({
      data: { city_hall_id, email, name, observation, phone },
    })
  }

  async delete(id: string): Promise<void> {
    await this.subCityHall.delete({ where: { id } })
  }

  async findByEmail(email: string): Promise<SubCityHall | null> {
    return this.subCityHall.findUnique({ where: { email } })
  }

  async findById(id: string): Promise<SubCityHall | null> {
    return this.subCityHall.findFirst({ where: { id } })
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResponse<SubCityHall>> {
    return prismaPaginator(this.subCityHall, params)
  }

  // private async findSubCityHalls({
  //   cityHallId,
  //   deleted,
  //   page,
  //   perPage,
  //   searchTerm,
  // }: Props): Promise<PaginatedResponse<SubCityHall>> {
  //   const conditions = deleted ? { NOT: { deleted_at: null } } : { deleted_at: null }

  //   if (cityHallId) {
  //     Object.assign(conditions, { city_hall_id: cityHallId })
  //   }

  //   const where = {
  //     ...conditions,
  //     OR: searchTerm
  //       ? [
  //           { name: { contains: searchTerm, mode: 'insensitive' } },
  //           { email: { contains: searchTerm, mode: 'insensitive' } },
  //         ]
  //       : undefined,
  //   } as any

  //   return prismaPaginator(this.subCityHall, { page, perPage, where })
  // }

  // async findAll({
  //   deleted = false,
  //   page,
  //   perPage,
  //   searchTerm,
  // }: PaginationParams): Promise<PaginatedResponse<SubCityHall>> {
  //   return this.findSubCityHalls({
  //     cityHallId: undefined,
  //     deleted,
  //     page,
  //     perPage,
  //     searchTerm,
  //   })
  // }

  // async findAllByCityHallId(
  //   cityHallId: string,
  //   searchTerm: string
  // ): Promise<SubCityHall[]> {
  //   const result = await this.findSubCityHalls({
  //     cityHallId,
  //     deleted: false,
  //     page: 1,
  //     perPage: 1000,
  //     searchTerm,
  //   })
  //   return result.data
  // }

  async update(id: string, data: UpdateSubCityHallData): Promise<SubCityHall> {
    const { city_hall_id, deleted_at, email, name, observation, phone } = data
    return this.subCityHall.update({
      data: { city_hall_id, deleted_at, email, name, observation, phone },
      where: { id },
    })
  }
}
