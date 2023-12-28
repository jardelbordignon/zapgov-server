import { Supertest, supertest } from 'test/e2e.helper'

import type { AuthUserData, CreateUserData } from 'src/contracts/account'

import { AUTH_URL, USERS_URL } from '../../shared/constants'

describe('Create user (E2E)', () => {
  let api: Supertest

  const email = 'johndoe@email.com'
  const name = 'John Doe'
  const password = 'Pwd@123'

  beforeAll(async () => {
    api = await supertest()
  })

  test(`[POST] ${USERS_URL} - success`, async () => {
    const response = await api.post(USERS_URL).send({ email, name, password })
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${USERS_URL} - success (role ADMIN)`, async () => {
    const adminEmail = 'admin@email.com'
    const createUserData: CreateUserData = {
      email: adminEmail,
      name,
      password,
      roles: ['ADMIN'],
    }
    const response = await api.post(USERS_URL).send(createUserData)
    expect(response.statusCode).toBe(201)
    const authUserData: AuthUserData = { email: adminEmail, password }
    const authRes = await api.post(AUTH_URL).send(authUserData)
    const getUsers = await api
      .get(USERS_URL)
      .set('Authorization', `Bearer ${authRes.body.accessToken}`)
      .send()
    expect(getUsers.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ name, roles: ['ADMIN'] })])
    )
  })

  test(`[POST] ${USERS_URL} - failure (same e-mail)`, async () => {
    const createUserData: CreateUserData = { email, name, password }
    await api.post(USERS_URL).send(createUserData)
    const response = await api.post(`${USERS_URL}?lang=en`).send(createUserData)
    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `User with ${email} email address already exists.`,
      statusCode: 409,
    })
  })
})
