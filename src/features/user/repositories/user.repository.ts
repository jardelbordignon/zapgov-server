import { User } from '@prisma/client'

import { CreateUserData, UpdateUserData } from 'src/contracts/account'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

export abstract class UserRepository {
  abstract create(data: CreateUserData): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract findAll(params: PaginationParams): Promise<PaginatedResponse<User>>
  abstract findAllDeleted(params: PaginationParams): Promise<PaginatedResponse<User>>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract update(id: string, data: UpdateUserData): Promise<User>
}
