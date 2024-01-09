import { Supertest, supertest } from 'test/e2e.helper'

import { AuthUserData, CreateUserData } from 'src/contracts/account'

import { USERS_URL } from '../../shared/constants'

describe('List users (E2E)', () => {
  let api: Supertest
  let authorization: string
  const password = 'Pwd@123'
  const names = ['John', 'Joe', 'James']

  beforeAll(async () => {
    api = await supertest()

    for (const name of names) {
      const createUserData: CreateUserData = {
        email: `${name.toLocaleLowerCase()}@email.com`,
        name,
        password,
      }

      await api.post(USERS_URL).send(createUserData)
    }

    const authUserData: AuthUserData = {
      email: `${names[0].toLocaleLowerCase()}@email.com`,
      password,
    }
    const authRes = await api.post('/auth').send(authUserData)
    authorization = `Bearer ${authRes.body.accessToken}`
  })

  test(`[GET] ${USERS_URL}`, async () => {
    const getUsers = await api
      .get(`${USERS_URL}?page=1&perPage=3`)
      .set('Authorization', authorization)
      .send()

    expect(getUsers.statusCode).toBe(200)
    expect(getUsers.body.data.length).toBe(3)
    expect(getUsers.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            email: 'john@email.com',
            id: expect.any(String),
            name: 'John',
          }),
          expect.objectContaining({ email: 'joe@email.com', name: 'Joe' }),
          expect.objectContaining({ email: 'james@email.com', name: 'James' }),
        ]),
        meta: {
          hasNext: false,
          hasPrevious: false,
          page: 1,
          perPage: 3,
          totalItems: 3,
          totalPages: 1,
        },
      })
    )
  })

  test(`[GET] ${USERS_URL} (ordered)`, async () => {
    let getUsers = await api
      .get(`${USERS_URL}?order=name&perPage=1`)
      .set('Authorization', authorization)
      .send()

    expect(getUsers.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([expect.objectContaining({ name: 'James' })]),
      })
    )

    getUsers = await api
      .get(`${USERS_URL}?order=name.desc&perPage=1`)
      .set('Authorization', authorization)
      .send()

    expect(getUsers.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([expect.objectContaining({ name: 'John' })]),
      })
    )
  })

  test(`[GET] ${USERS_URL} (filtered)`, async () => {
    const getUsers = await api
      .get(`${USERS_URL}?page=1&perPage=3&filter=name,email=jo`)
      .set('Authorization', authorization)
      .send()

    expect(getUsers.statusCode).toBe(200)
    expect(getUsers.body.data.length).toBe(2)
    expect(getUsers.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ email: 'john@email.com', name: 'John' }),
          expect.objectContaining({ email: 'joe@email.com', name: 'Joe' }),
        ]),
        meta: {
          hasNext: false,
          hasPrevious: false,
          page: 1,
          perPage: 3,
          totalItems: 2,
          totalPages: 1,
        },
      })
    )
  })
})
