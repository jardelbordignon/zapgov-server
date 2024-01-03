import { CreateWaAccountData, UpdateWaAccountData } from 'src/contracts/wa-account'
import {
  PaginatedResponse,
  PaginationParams,
  paginator,
} from 'src/infra/providers/pagination'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import { WaAccountEntity } from '../wa-account.entity'

import { WaAccountRepository } from './wa-account.repository'

export class PrismaWaAccountRepository
  extends PrismaService
  implements WaAccountRepository
{
  async create(data: CreateWaAccountData): Promise<WaAccountEntity> {
    const { acronym, city_hall_id, phone } = data
    return this.waAccount.create({ data: { acronym, city_hall_id, phone } })
  }

  async delete(id: string): Promise<void> {
    await this.waAccount.delete({ where: { id } })
  }

  async findById(id: string): Promise<WaAccountEntity | null> {
    return this.waAccount.findFirst({ where: { id } })
  }

  async findByAcronym(acronym: string): Promise<WaAccountEntity | null> {
    return this.waAccount.findFirst({ where: { acronym } })
  }

  findByPhone(phone: string): Promise<WaAccountEntity | null> {
    return this.waAccount.findFirst({ where: { phone } })
  }

  async findAll({
    deleted,
    page,
    perPage,
    searchTerm,
  }: PaginationParams): Promise<PaginatedResponse<WaAccountEntity>> {
    const deletedCondition = deleted
      ? { NOT: { deleted_at: null } }
      : { deleted_at: null }

    const where = {
      ...deletedCondition,
      OR: searchTerm
        ? [{ acronym: { contains: searchTerm, mode: 'insensitive' } }]
        : undefined,
    } as any

    return paginator(this.waAccount, { page, perPage, where })
  }

  async update(id: string, data: UpdateWaAccountData): Promise<WaAccountEntity> {
    const { acronym, city_hall_id, phone } = data
    return this.waAccount.update({
      data: { acronym, city_hall_id, phone },
      where: { id },
    })
  }
}
