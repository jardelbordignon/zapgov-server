import type { User } from '@prisma/client'

export type AuthenticateData = Pick<User, 'email' | 'password'>
export type AuthenticateResponse = { accessToken: string }

export type CreateUserData = Pick<User, 'name' | 'email' | 'password'>

export type UserOmittedPassword = Omit<User, 'password'>

export type ListUsersResponse = UserOmittedPassword[]

export type ShowUserResponse = UserOmittedPassword

export type UpdateUserData = Partial<
  { currentPassword?: string } & Omit<User, 'id' | 'created_at' | 'updated_at'>
>
export type UpdateUserResponse = UserOmittedPassword
