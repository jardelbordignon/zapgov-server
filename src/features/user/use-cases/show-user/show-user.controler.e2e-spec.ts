import { Supertest, supertest } from 'test/e2e.helper'

import { USERS_URL } from '../../shared/constants'

describe('Show user (E2E)', () => {
  let api: Supertest
  let authorization: string
  const email = 'johndoe@email.com'
  const name = 'John Doe'
  const password = 'Pwd@123'

  beforeAll(async () => {
    api = await supertest()

    await api.post(USERS_URL).send({ email, name, password })
    const authRes = await api.post('/auth').send({ email, password })
    authorization = `Bearer ${authRes.body.accessToken}`
  })

  test(`[GET] ${USERS_URL} - success`, async () => {
    const getUsers = await api
      .get(USERS_URL)
      .set('Authorization', authorization)
      .send()

    const firstUserId = getUsers.body.data[0].id

    const getUser = await api
      .get(`${USERS_URL}/${firstUserId}`)
      .set('Authorization', authorization)
      .send()

    expect(getUser.statusCode).toBe(200)
    expect(getUser.body).toEqual(expect.objectContaining({ email, name }))
  })

  test(`[GET] ${USERS_URL}/:id - failure`, async () => {
    const getUser = await api
      .get(`${USERS_URL}/invalid-user-id?lang=en`)
      .set('Authorization', authorization)
      .send()

    expect(getUser.statusCode).toBe(404)
    expect(getUser.body).toEqual(
      expect.objectContaining({
        error: 'Not Found',
        message: 'User not found.',
        statusCode: 404,
      })
    )
  })
})
