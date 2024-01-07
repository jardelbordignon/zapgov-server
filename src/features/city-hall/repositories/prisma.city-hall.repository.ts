import type { CityHall } from '@prisma/client'

import { CreateCityHallData, UpdateCityHallData } from 'src/contracts/city-halls'
import {
  PaginatedResponse,
  PaginationParams,
  prismaPaginator,
} from 'src/infra/providers/pagination'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import {
  CityHallInclude,
  CityHallRepository,
  ShowCityHallResponse,
} from './city-hall.repository'

export class PrismaCityHallRepository
  extends PrismaService
  implements CityHallRepository
{
  async create(data: CreateCityHallData): Promise<CityHall> {
    const { email, name, phone, slug, txt_color } = data
    return this.cityHall.create({ data: { email, name, phone, slug, txt_color } })
  }

  async delete(id: string): Promise<void> {
    await this.cityHall.delete({ where: { id } })
  }

  async findByEmail(
    email: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    return this.cityHall.findUnique({ include, where: { email } })
  }

  async findById(
    id: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    return this.cityHall.findFirst({ include, where: { id } })
  }

  async findBySlug(
    slug: string,
    include?: CityHallInclude
  ): Promise<ShowCityHallResponse> {
    return this.cityHall.findUnique({ include, where: { slug } })
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResponse<CityHall>> {
    return prismaPaginator(this.cityHall, params)
  }

  async update(id: string, data: UpdateCityHallData): Promise<CityHall> {
    const { deleted_at, email, name, phone, slug, txt_color } = data
    return this.cityHall.update({
      data: { deleted_at, email, name, phone, slug, txt_color },
      where: { id },
    })
  }
}
