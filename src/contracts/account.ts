import type { User } from '@prisma/client'

/** POST - /auth */
export type AuthUserData = Pick<User, 'email' | 'password'>
export type AuthUserResponse = { accessToken: string; isAdmin: boolean }

/** POST - /users  */
export type CreateUserData = Pick<User, 'name' | 'email' | 'password'> &
  Partial<Pick<User, 'roles'>>

export type UserOmittedPassword = Omit<User, 'password'>

export type ListUsersResponse = UserOmittedPassword[]

export type ShowUserResponse = UserOmittedPassword

export type UpdateUserData = Partial<
  { currentPassword?: string } & Omit<User, 'id' | 'created_at' | 'updated_at'>
>
export type UpdateUserResponse = UserOmittedPassword
