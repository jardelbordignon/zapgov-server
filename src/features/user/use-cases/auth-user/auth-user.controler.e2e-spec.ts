import { Supertest, supertest } from 'test/e2e.helper'

import { AUTH_URL, USERS_URL } from '../../shared/constants'

describe('Auth user (E2E)', () => {
  let api: Supertest

  const email = 'johndoe@email.com'
  const name = 'John Doe'
  const password = 'Pwd@123'

  beforeAll(async () => {
    api = await supertest()
    await api.post(USERS_URL).send({ email, name, password })
  })

  test(`[POST] ${AUTH_URL} - success`, async () => {
    const authRes = await api.post(AUTH_URL).send({ email, password })

    expect(authRes.statusCode).toBe(200)
    expect(authRes.body).toEqual({
      accessToken: expect.any(String),
      isAdmin: expect.any(Boolean),
    })
  })

  test(`[POST] ${AUTH_URL} - failure (invalid credentials)`, async () => {
    const authRes = await api
      .post(`${AUTH_URL}?lang=en`)
      .send({ email, password: 'wrong' })

    expect(authRes.statusCode).toBe(401)
    expect(authRes.body).toEqual({
      error: 'Unauthorized',
      message: 'Credentials are not valid.',
      statusCode: 401,
    })
  })
})
