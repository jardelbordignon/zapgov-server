import { User } from '@prisma/client'

import { CreateUserData, UpdateUserData } from 'src/contracts/account'

export abstract class UserRepository {
  abstract create(data: CreateUserData): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract findAll(): Promise<User[]>
  abstract findAllDeleted(): Promise<User[]>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract update(id: string, data: UpdateUserData): Promise<User>
}
