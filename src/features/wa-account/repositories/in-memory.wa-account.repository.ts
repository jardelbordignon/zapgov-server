import { randomUUID } from 'node:crypto'

import { CreateWaAccountData, UpdateWaAccountData } from 'src/contracts/wa-account'
import { ListParams, ListResponse, inMemoryList } from 'src/infra/providers/list'

import { WaAccountEntity } from '../wa-account.entity'

import { WaAccountRepository } from './wa-account.repository'

export class InMemoryWaAccountRepository implements WaAccountRepository {
  waAccounts: WaAccountEntity[] = []

  async create(data: CreateWaAccountData): Promise<WaAccountEntity> {
    const date = new Date()

    const waAccount: WaAccountEntity = {
      ...data,
      contacts_qty: 0,
      created_at: date,
      deleted_at: null,
      id: randomUUID(),
      updated_at: date,
    }

    this.waAccounts.push(waAccount)

    return waAccount
  }

  async delete(id: string): Promise<void> {
    this.waAccounts = this.waAccounts.filter(item => item.id !== id)
  }

  async findById(id: string): Promise<WaAccountEntity | null> {
    const item = this.waAccounts.find(item => item.id === id)
    return item || null
  }

  async findByAcronym(acronym: string): Promise<WaAccountEntity | null> {
    const item = this.waAccounts.find(item => item.acronym === acronym)
    return item || null
  }

  async findByPhone(phone: string): Promise<WaAccountEntity | null> {
    const item = this.waAccounts.find(item => item.phone === phone)
    return item || null
  }

  async findAll(params?: ListParams): Promise<ListResponse<WaAccountEntity>> {
    return inMemoryList(this.waAccounts, params)
  }

  async update(id: string, data: UpdateWaAccountData): Promise<WaAccountEntity> {
    const index = this.waAccounts.findIndex(item => item.id === id)
    this.waAccounts[index] = Object.assign(this.waAccounts[index], data)
    return this.waAccounts[index]
  }
}
