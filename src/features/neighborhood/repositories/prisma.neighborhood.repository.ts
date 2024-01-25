import type { Neighborhood } from '@prisma/client'

import {
  CreateNeighborhoodData,
  UpdateNeighborhoodData,
} from 'src/contracts/neighborhoods'
import { ListParams, ListResponse, prismaList } from 'src/infra/providers/list'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import { NeighborhoodRepository } from './neighborhood.repository'

export class PrismaNeighborhoodRepository
  extends PrismaService
  implements NeighborhoodRepository
{
  async create(data: CreateNeighborhoodData): Promise<Neighborhood> {
    const { cep, city_hall_id, locality, name, observation, sub_city_hall_id } = data
    return this.neighborhood.create({
      data: { cep, city_hall_id, locality, name, observation, sub_city_hall_id },
    })
  }

  async delete(id: string): Promise<void> {
    await this.neighborhood.delete({ where: { id } })
  }

  async findByName(name: string): Promise<Neighborhood | null> {
    return this.neighborhood.findFirst({ where: { name } })
  }

  async findById(id: string): Promise<Neighborhood | null> {
    return this.neighborhood.findFirst({ where: { id } })
  }

  async findAll(params?: ListParams): Promise<ListResponse<Neighborhood>> {
    return prismaList(this.neighborhood, params)
  }

  async update(id: string, data: UpdateNeighborhoodData): Promise<Neighborhood> {
    const {
      cep,
      city_hall_id,
      deleted_at,
      locality,
      name,
      observation,
      sub_city_hall_id,
    } = data
    return this.neighborhood.update({
      data: {
        cep,
        city_hall_id,
        deleted_at,
        locality,
        name,
        observation,
        sub_city_hall_id,
      },
      where: { id },
    })
  }
}
