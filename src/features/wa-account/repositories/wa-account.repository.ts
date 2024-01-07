import { CreateWaAccountData, UpdateWaAccountData } from 'src/contracts/wa-account'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

import { WaAccountEntity } from '../wa-account.entity'

export abstract class WaAccountRepository {
  abstract create(data: CreateWaAccountData): Promise<WaAccountEntity>
  abstract delete(id: string): Promise<void>
  abstract findById(id: string): Promise<WaAccountEntity | null>
  abstract findByAcronym(acronym: string): Promise<WaAccountEntity | null>
  abstract findByPhone(phone: string): Promise<WaAccountEntity | null>
  abstract findAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<WaAccountEntity>>
  abstract update(id: string, data: UpdateWaAccountData): Promise<WaAccountEntity>
}
