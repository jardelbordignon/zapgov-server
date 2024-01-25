import { User } from '@prisma/client'

import { CreateUserData, UpdateUserData } from 'src/contracts/account'
import { ListParams, ListResponse } from 'src/infra/providers/list'

export abstract class UserRepository {
  abstract create(data: CreateUserData): Promise<User>
  abstract delete(id: string): Promise<void>
  abstract findAll(params?: ListParams): Promise<ListResponse<User>>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract update(id: string, data: UpdateUserData): Promise<User>
}
