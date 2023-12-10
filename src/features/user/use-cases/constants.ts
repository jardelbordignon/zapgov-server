import { CreateUserData } from 'src/contracts/account'

export const AUTH_URL = '/auth'
export const USERS_URL = '/users'

export const CREATE_ADMIN_USER_DATA: CreateUserData = {
  email: 'johndoe@email.com',
  name: 'John Doe',
  password: 'Pwd@123',
  roles: ['ADMIN'],
}

export const CREATE_REGULAR_USER_DATA: CreateUserData = {
  email: 'joesmith@email.com',
  name: 'Joe Smith',
  password: 'Pwd@123',
}
