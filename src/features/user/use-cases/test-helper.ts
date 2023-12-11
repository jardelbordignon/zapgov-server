import { CreateUserData } from 'src/contracts/account'

import { AUTH_URL, USERS_URL } from './constants'

export * from './constants'

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

export const getUserAuthorization = async (api: any) => {
  const email = 'userx@email.com'
  const name = 'User X'
  const password = 'Pwd@123'
  const data = { email, name, password }
  await api.post(USERS_URL).send(data)
  const response = await api.post(AUTH_URL).send(data)
  return `Bearer ${response.body.accessToken}`
}
