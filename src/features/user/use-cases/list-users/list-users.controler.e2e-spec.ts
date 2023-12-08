import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { AuthUserData, CreateUserData } from 'src/contracts/account'

import { USERS_URL } from '../constants'

describe('List users (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let accessToken: string
  const password = 'Pwd@123'
  const names = ['John', 'Joe', 'James']

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

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
    accessToken = authRes.body.accessToken
  })

  test(`[GET] ${USERS_URL}`, async () => {
    const getUsers = await api
      .get(`${USERS_URL}?page=1&perPage=3`)
      .set('Authorization', `Bearer ${accessToken}`)
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
})
