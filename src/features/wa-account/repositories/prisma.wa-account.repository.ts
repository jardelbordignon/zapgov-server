import { WaAccount } from '@prisma/client'

import { CreateWaAccountData, UpdateWaAccountData } from 'src/contracts/wa-account'
import {
  PaginatedResponse,
  PaginationParams,
  prismaPaginator,
} from 'src/infra/providers/pagination'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import { WaAccountRepository } from './wa-account.repository'

export class PrismaWaAccountRepository
  extends PrismaService
  implements WaAccountRepository
{
  async create(data: CreateWaAccountData): Promise<WaAccount> {
    const { acronym, city_hall_id, phone } = data
    return this.waAccount.create({ data: { acronym, city_hall_id, phone } })
  }

  async delete(id: string): Promise<void> {
    await this.waAccount.delete({ where: { id } })
  }

  async findById(id: string): Promise<WaAccount | null> {
    return this.waAccount.findFirst({ where: { id } })
  }

  async findByAcronym(acronym: string): Promise<WaAccount | null> {
    return this.waAccount.findFirst({ where: { acronym } })
  }

  findByPhone(phone: string): Promise<WaAccount | null> {
    return this.waAccount.findFirst({ where: { phone } })
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResponse<WaAccount>> {
    return prismaPaginator(this.waAccount, params)
  }

  async update(id: string, data: UpdateWaAccountData): Promise<WaAccount> {
    const { acronym, city_hall_id, contacts_qty, deleted_at, phone } = data
    return this.waAccount.update({
      data: { acronym, city_hall_id, contacts_qty, deleted_at, phone },
      where: { id },
    })
  }
}
